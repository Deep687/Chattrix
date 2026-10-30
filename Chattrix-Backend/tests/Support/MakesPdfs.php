<?php

namespace Tests\Support;

/**
 * Builds a minimal real PDF, one text line per page, so extraction tests need no binary fixtures.
 */
trait MakesPdfs
{
    /**
     * @param  list<string>  $pages
     */
    protected function pdf(array $pages): string
    {
        $fontId = 3 + count($pages) * 2;
        $objects = [1 => '<< /Type /Catalog /Pages 2 0 R >>'];
        $kids = [];

        foreach ($pages as $i => $text) {
            $pageId = 3 + $i * 2;
            $contentId = $pageId + 1;
            $kids[] = "{$pageId} 0 R";
            $stream = 'BT /F1 12 Tf 72 720 Td ('.addcslashes($text, '()\\').') Tj ET';

            $objects[$pageId] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents {$contentId} 0 R /Resources << /Font << /F1 {$fontId} 0 R >> >> >>";
            $objects[$contentId] = '<< /Length '.strlen($stream)." >>\nstream\n{$stream}\nendstream";
        }

        $objects[2] = '<< /Type /Pages /Kids ['.implode(' ', $kids).'] /Count '.count($pages).' >>';
        $objects[$fontId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
        ksort($objects);

        $pdf = "%PDF-1.4\n";
        $offsets = [];

        foreach ($objects as $id => $object) {
            $offsets[] = strlen($pdf);
            $pdf .= "{$id} 0 obj\n{$object}\nendobj\n";
        }

        $xref = strlen($pdf);
        $pdf .= "xref\n0 ".(count($objects) + 1)."\n0000000000 65535 f \n";

        foreach ($offsets as $offset) {
            $pdf .= sprintf("%010d 00000 n \n", $offset);
        }

        return $pdf.'trailer << /Size '.(count($objects) + 1)." /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF";
    }
}
