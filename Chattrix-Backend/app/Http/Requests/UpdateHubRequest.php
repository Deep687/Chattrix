<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UpdateHubRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check();
    }

    public function rules(): array
    {
        $hub = $this->route('hub');

        return [
            'description' => 'sometimes|nullable|string|max:5000',

            'slug' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('hubs', 'slug')->ignore($hub->id),
                'regex:/^[a-z0-9-]+$/'
            ],

            'avatar' => 'sometimes|nullable|image|max:2048',

            'privacy_type' => ['sometimes', Rule::in(['public', 'private'])],
        ];
    }
}
