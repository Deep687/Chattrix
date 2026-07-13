<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class CreateHubRequest extends FormRequest
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

            'slug' => [
                'required',
                'string',
                'max:255',
                'unique:hubs,slug',
                'regex:/^[a-z0-9-]+$/',
            ],

            'avatar' => 'nullable|image|max:2048',

            'privacy_type' => ['required', Rule::in(['public', 'private'])],
        ];
    }
}
