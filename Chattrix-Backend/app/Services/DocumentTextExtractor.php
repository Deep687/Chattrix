<?php

namespace App\Services;

use App\Models\Document;
use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Parser;
use Throwable;

/**
 * Turns a stored upload into clean text, one entry per page so chunks can cite a page number.
 */
class DocumentTextExtractor
{
    /**
     * @param  Document  $document
     * @return list<array{page: ?int, text: string}>
     *
     * @throws DocumentProcessingException
     */
    public function extract(Document $document): array
    {
        $contents = Storage::disk('local')->get($document->path);

        if ($contents === null) {
            throw new DocumentProcessingException('The uploaded file is missing. Upload it again.');
        }

        $pages = $document->mime_type === 'application/pdf'
            ? $this->pdfPages($contents)
            : [['page' => null, 'text' => $this->toUtf8($contents)]];

        return array_values(array_filter(
            array_map(fn (array $page) => ['page' => $page['page'], 'text' => $this->clean($page['text'])], $pages),
            fn (array $page) => $page['text'] !== '',
        ));
    }

    /**
     * @return list<array{page: int, text: string}>
     */
    private function pdfPages(string $contents): array
    {
        try {
            $pdf = (new Parser)->parseContent($contents);
        } catch (Throwable $e) {
            // smalot throws on encrypted and malformed files alike; neither will ever succeed.
            throw new DocumentProcessingException('This PDF could not be read. It may be encrypted or damaged.', previous: $e);
        }

        $pages = [];

        foreach ($pdf->getPages() as $index => $page) {
            $pages[] = ['page' => $index + 1, 'text' => $this->toUtf8($page->getText())];
        }

        return $pages;
    }

    private function toUtf8(string $text): string
    {
        return mb_check_encoding($text, 'UTF-8') ? $text : mb_convert_encoding($text, 'UTF-8', 'Windows-1252');
    }

    /**
     * Normalises whitespace while keeping blank lines, which the chunker uses as paragraph breaks.
     */
    private function clean(string $text): string
    {
        $text = str_replace(["\r\n", "\r"], "\n", $text);
        // Control characters other than tab and newline, which PDFs often leave behind.
        $text = preg_replace('/[^\P{C}\t\n]/u', '', $text) ?? '';
        // Rejoin words hyphenated across a line break: "reimburse-\nment" → "reimbursement".
        $text = preg_replace('/(\p{L})-\n(\p{Ll})/u', '$1$2', $text) ?? '';
        $text = preg_replace('/[ \t\x{00A0}]+/u', ' ', $text) ?? '';
        $text = preg_replace('/ *\n */', "\n", $text) ?? '';
        $text = preg_replace('/\n{3,}/', "\n\n", $text) ?? '';

        return trim($text);
    }
}
