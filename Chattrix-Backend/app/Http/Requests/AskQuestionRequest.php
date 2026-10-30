<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AskQuestionRequest extends FormRequest
{
    /**
     * Authorised in the controller against `WorkspacePolicy::ask`.
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
            'question' => ['required', 'string', 'max:'.config('rag.max_question_length')],
            // Absent for the first question of a new thread.
            'conversation_id' => ['nullable', 'integer'],
        ];
    }
}
