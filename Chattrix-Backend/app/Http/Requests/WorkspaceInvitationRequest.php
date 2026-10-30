<?php

namespace App\Http\Requests;

use App\Models\Workspace;
use App\Traits\NormalizesEmail;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class WorkspaceInvitationRequest extends FormRequest
{
    use NormalizesEmail;

    /**
     * Owner check lives here, not in the controller: it must run before the membership rule
     * below, or a non-owner could probe who belongs to a workspace from the 422.
     */
    public function authorize(): bool
    {
        return $this->user()->can('manageMembers', $this->route('workspace'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Workspace $workspace */
        $workspace = $this->route('workspace');

        return [
            'email' => [
                'required',
                'email',
                function (string $attribute, mixed $value, Closure $fail) use ($workspace) {
                    if ($workspace->members()->where('email', $value)->exists()) {
                        $fail('This person is already a member of this workspace.');
                    }
                },
            ],
        ];
    }
}
