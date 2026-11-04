<?php

namespace Tests\Unit;

use App\Services\ChunkingService;
use PHPUnit\Framework\TestCase;

class ChunkingServiceTest extends TestCase
{
    public function test_an_empty_document_has_no_chunks(): void
    {
        $chunker = new ChunkingService(200, 30);

        $this->assertSame([], $chunker->chunk([]));
        $this->assertSame([], $chunker->chunk([['page' => 1, 'text' => "  \n\n "]]));
    }

    public function test_a_short_document_is_one_chunk_with_exact_offsets(): void
    {
        $text = "Leave policy.\n\nEmployees get 20 days.";

        $chunks = (new ChunkingService(200, 30))->chunk([['page' => null, 'text' => $text]]);

        $this->assertCount(1, $chunks);
        $this->assertSame($text, $chunks[0]['content']);
        $this->assertSame(0, $chunks[0]['char_start']);
        $this->assertSame(mb_strlen($text), $chunks[0]['char_end']);
        $this->assertNull($chunks[0]['page']);
    }

    public function test_no_chunk_exceeds_the_size_limit(): void
    {
        $text = implode("\n\n", array_map(fn ($i) => str_repeat("Sentence {$i} is here. ", 8), range(1, 40)));

        $chunks = (new ChunkingService(500, 80))->chunk([['page' => 1, 'text' => $text]]);

        $this->assertGreaterThan(5, count($chunks));

        foreach ($chunks as $chunk) {
            $this->assertLessThanOrEqual(500, strlen($chunk['content']));
        }
    }

    public function test_consecutive_chunks_overlap_and_cover_the_whole_text(): void
    {
        $paragraphs = array_map(fn ($i) => "Paragraph {$i} says rule {$i} applies.", range(1, 60));
        $text = implode("\n\n", $paragraphs);

        $chunks = (new ChunkingService(300, 80))->chunk([['page' => 1, 'text' => $text]]);

        for ($i = 1; $i < count($chunks); $i++) {
            $this->assertLessThan($chunks[$i - 1]['char_end'], $chunks[$i]['char_start'], "Chunk {$i} does not overlap its predecessor.");
            $this->assertGreaterThan($chunks[$i - 1]['char_start'], $chunks[$i]['char_start'], "Chunk {$i} made no progress.");
        }

        foreach ($paragraphs as $paragraph) {
            $this->assertTrue(
                collect($chunks)->contains(fn ($chunk) => str_contains($chunk['content'], $paragraph)),
                "\"{$paragraph}\" was split across chunks or lost.",
            );
        }
    }

    public function test_offsets_slice_the_original_text_in_characters(): void
    {
        $text = implode("\n\n", array_map(fn ($i) => "Règle {$i}: congés payés — 20 jours.", range(1, 30)));

        $chunks = (new ChunkingService(200, 40))->chunk([['page' => 1, 'text' => $text]]);

        foreach ($chunks as $chunk) {
            $this->assertTrue(mb_check_encoding($chunk['content'], 'UTF-8'));
            $this->assertSame($chunk['content'], mb_substr($text, $chunk['char_start'], $chunk['char_end'] - $chunk['char_start']));
        }
    }

    public function test_a_huge_unbroken_text_is_hard_split_without_breaking_characters(): void
    {
        $text = str_repeat('é', 5000);

        $chunks = (new ChunkingService(1000, 100))->chunk([['page' => 1, 'text' => $text]]);

        $this->assertGreaterThan(1, count($chunks));

        foreach ($chunks as $chunk) {
            $this->assertTrue(mb_check_encoding($chunk['content'], 'UTF-8'));
            $this->assertLessThanOrEqual(1000, strlen($chunk['content']));
        }

        $this->assertSame(mb_strlen($text), end($chunks)['char_end']);
    }

    public function test_a_chunk_never_spans_two_pages(): void
    {
        // Small pages that would all fit in one chunk if page breaks were ignored.
        $pages = [
            ['page' => 1, 'text' => 'Working hours are 9:30 to 6:30.'],
            ['page' => 2, 'text' => 'Casual leave is 8 days per year.'],
            ['page' => 3, 'text' => 'Notice period is 60 days.'],
        ];

        $chunks = (new ChunkingService(2000, 300))->chunk($pages);

        $this->assertSame([1, 2, 3], array_column($chunks, 'page'));
        $this->assertSame('Casual leave is 8 days per year.', $chunks[1]['content']);
    }

    public function test_overlap_does_not_carry_text_across_a_page_break(): void
    {
        $pages = [
            ['page' => 1, 'text' => str_repeat('Page one text. ', 40)],
            ['page' => 2, 'text' => str_repeat('Page two text. ', 40)],
        ];

        $chunks = (new ChunkingService(200, 50))->chunk($pages);

        foreach ($chunks as $chunk) {
            $this->assertStringNotContainsString($chunk['page'] === 1 ? 'Page two' : 'Page one', $chunk['content']);
        }

        $this->assertSame([1, 2], array_values(array_unique(array_column($chunks, 'page'))));
    }
}
