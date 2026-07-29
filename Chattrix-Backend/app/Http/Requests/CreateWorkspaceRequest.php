<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class CreateWorkspaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check();
    }

    /**
     * Validation rules.
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',

            'description' => 'nullable|string|max:5000',

            'avatar' => 'nullable|image|max:2048',
        ];
    }
}
