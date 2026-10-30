<?php

namespace App\Http\Requests;

use App\Rules\RelativePath;
use App\Traits\NormalizesEmail;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class CreateUserRequest extends FormRequest
{
    use NormalizesEmail;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Password::default()],
            // Where the verification link should land, e.g. the invite they arrived from.
            'next' => ['nullable', 'string', 'max:255', new RelativePath],
            // Present only on "register your company"; creates the first workspace with the account.
            'company_name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
