<?php

namespace App\Http\Resources;

use App\Models\ConversationMessage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Usage stays server-side: token counts are for the trace panel (M7), not for every employee.
 *
 * @mixin ConversationMessage
 */
class ConversationMessageResource extends JsonResource
{
    /**
     * @param  Request  $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'role' => $this->role,
            'content' => $this->content,
            'search_query' => $this->search_query,
            'sources' => $this->sources ?? [],
            'cited' => $this->cited ?? [],
            'answered' => $this->answered,
            'created_at' => $this->created_at,
        ];
    }
}
