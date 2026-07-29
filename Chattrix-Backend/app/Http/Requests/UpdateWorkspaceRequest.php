<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class UpdateWorkspaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Auth::check();
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',

            'description' => 'sometimes|nullable|string|max:5000',

            'avatar' => 'sometimes|nullable|image|max:2048',
        ];
    }
}
