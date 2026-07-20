<?php

namespace App\Actions\User;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class UpdateProfileAction
{
    /**
     * @param User $user
     * @param array $data
     * @param UploadedFile|null $avatar
     * @return User
     */
    public function handle(User $user, array $data, ?UploadedFile $avatar = null): User
    {
        if ($avatar) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $data['avatar'] = $avatar->store('avatars', 'public');
        }

        $user->update($data);

        return $user;
    }
}
