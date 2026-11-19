<?php

namespace App\Http\Requests;

use App\Enums\DocumentAudience;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDocumentRequest extends FormRequest
{
    /**
     * Authorised in the controller against `WorkspacePolicy::updateDocument`.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'audience' => ['required', Rule::enum(DocumentAudience::class)],
        ];
    }
}
