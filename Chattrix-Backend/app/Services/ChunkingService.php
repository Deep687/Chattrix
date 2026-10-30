<?php

namespace App\Services;

/**
 * Splits a document into overlapping, retrieval-sized passages.
 *
 * Cuts fall on paragraph breaks where possible, then sentence ends, and only then mid-text, so a
 * passage reads as a whole thought. Overlap repeats the tail of one chunk at the head of the next,
 * so a rule that straddles a boundary is still found intact in at least one of them.
 *
 * A chunk never crosses a page break, so its page number is exact: a citation that says "page 2"
 * must not point at a passage that is mostly on page 1.
 */
class ChunkingService
{
    public function __construct(
        private int $chunkSize = 2000,
        private int $overlap = 300,
    ) {}

    /**
     * @param  list<array{page: ?int, text: string}>  $pages
     * @return list<array{content: string, page: ?int, char_start: int, char_end: int, token_count: int}>
     */
    public function chunk(array $pages): array
    {
        [$text, $pageRanges] = $this->join($pages);

        $spans = [];

        foreach ($pageRanges as [$start, $end, $page]) {
            $current = [];

            foreach ($this->units($text, $start, $end) as $unit) {
                if ($current !== [] && $this->chunkSize < $unit[1] - $current[0][0]) {
                    $spans[] = [$current[0][0], end($current)[1], $page];
                    $current = $this->overlapTail($current, $unit);
                }

                $current[] = $unit;
            }

            if ($current !== []) {
                $spans[] = [$current[0][0], end($current)[1], $page];
            }
        }

        return $this->toChunks($text, $spans);
    }

    /**
     * Joins pages into one text, remembering the byte range each page occupies.
     *
     * @param  list<array{page: ?int, text: string}>  $pages
     * @return array{0: string, 1: list<array{0: int, 1: int, 2: ?int}>}
     */
    private function join(array $pages): array
    {
        $text = '';
        $pageRanges = [];

        foreach ($pages as $page) {
            if (trim($page['text']) === '') {
                continue;
            }

            if ($text !== '') {
                $text .= "\n\n";
            }

            $start = strlen($text);
            $text .= $page['text'];
            $pageRanges[] = [$start, strlen($text), $page['page']];
        }

        return [$text, $pageRanges];
    }

    /**
     * Byte spans of the smallest pieces a chunk is built from, none longer than a chunk.
     *
     * @return list<array{0: int, 1: int}>
     */
    private function units(string $text, int $start, int $end): array
    {
        $units = [];

        foreach ($this->split(substr($text, $start, $end - $start), '/\n\s*\n/', $start) as $paragraph) {
            if ($this->chunkSize >= $paragraph[1] - $paragraph[0]) {
                $units[] = $paragraph;

                continue;
            }

            $sentences = $this->split(substr($text, $paragraph[0], $paragraph[1] - $paragraph[0]), '/(?<=[.!?])\s+/', $paragraph[0]);

            foreach ($sentences as $sentence) {
                array_push($units, ...$this->hardSplit($text, $sentence));
            }
        }

        return $units;
    }

    /**
     * @return list<array{0: int, 1: int}>
     */
    private function split(string $text, string $pattern, int $offset): array
    {
        $pieces = preg_split($pattern, $text, -1, PREG_SPLIT_NO_EMPTY | PREG_SPLIT_OFFSET_CAPTURE) ?: [];

        return array_values(array_filter(
            array_map(fn (array $piece) => [$offset + $piece[1], $offset + $piece[1] + strlen(rtrim($piece[0]))], $pieces),
            fn (array $span) => $span[1] > $span[0],
        ));
    }

    /**
     * Last resort for a sentence longer than a chunk. `mb_strcut` never cuts a UTF-8 character in half.
     *
     * @param  array{0: int, 1: int}  $span
     * @return list<array{0: int, 1: int}>
     */
    private function hardSplit(string $text, array $span): array
    {
        $pieces = [];
        [$start, $end] = $span;

        while ($end - $start > $this->chunkSize) {
            $length = strlen(mb_strcut($text, $start, $this->chunkSize, 'UTF-8'));
            $pieces[] = [$start, $start + $length];
            $start += $length;
        }

        $pieces[] = [$start, $end];

        return $pieces;
    }

    /**
     * The trailing units of the closed chunk that fit in the overlap budget, and still leave room
     * for the next unit. Never the whole chunk, or the next chunk would make no progress.
     *
     * @param  list<array{0: int, 1: int}>  $current
     * @param  array{0: int, 1: int}  $next
     * @return list<array{0: int, 1: int}>
     */
    private function overlapTail(array $current, array $next): array
    {
        $tail = [];

        for ($i = count($current) - 1; $i > 0; $i--) {
            $start = $current[$i][0];

            if ($current[count($current) - 1][1] - $start > $this->overlap || $this->chunkSize < $next[1] - $start) {
                break;
            }

            array_unshift($tail, $current[$i]);
        }

        return $tail;
    }

    /**
     * Converts byte spans to chunks. Offsets are stored in characters, so a later deep link can
     * highlight the passage in the text without knowing it was ever UTF-8 bytes.
     *
     * @param  list<array{0: int, 1: int, 2: ?int}>  $spans
     * @return list<array{content: string, page: ?int, char_start: int, char_end: int, token_count: int}>
     */
    private function toChunks(string $text, array $spans): array
    {
        return array_map(function (array $span) use ($text) {
            $content = substr($text, $span[0], $span[1] - $span[0]);
            $charStart = mb_strlen(substr($text, 0, $span[0]), 'UTF-8');

            return [
                'content' => $content,
                'page' => $span[2],
                'char_start' => $charStart,
                'char_end' => $charStart + mb_strlen($content, 'UTF-8'),
                // An estimate (~4 bytes per token); exact counts would cost an API call per chunk.
                'token_count' => (int) ceil(strlen($content) / 4),
            ];
        }, $spans);
    }
}
