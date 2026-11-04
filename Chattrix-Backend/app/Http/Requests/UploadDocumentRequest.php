<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UploadDocumentRequest extends FormRequest
{
    /**
     * Authorised in the controller against `WorkspacePolicy::uploadDocument`.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * `extensions` checks the name, `mimes` the sniffed content: a renamed .exe fails the second.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'extensions:pdf,txt,md', 'mimes:pdf,txt,md', 'max:10240'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.extensions' => 'Upload a PDF, TXT or Markdown file.',
            'file.mimes' => 'Upload a PDF, TXT or Markdown file.',
            'file.max' => 'Files can be at most 10 MB.',
        ];
    }
}
