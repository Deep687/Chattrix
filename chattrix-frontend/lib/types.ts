/** Mirrors `App\Http\Resources\WorkspaceResource`. */
export type Workspace = {
    id: number;
    name: string;
    description: string | null;
    avatar: string | null;
    owner_id: number;
    /**
     * Whether the caller owns this workspace. Derived server-side from `owner_id`, so it is
     * always present — unlike the pivot role it replaced, which was absent on any workspace
     * not fetched through the membership relation.
     */
    is_owner: boolean;
    created_at: string;
};

/** Envelope produced by `App\Traits\ApiResponser`. */
export type ApiResponse<T> = {
    data: T;
    statusCode: number;
    message: string;
};

/** Mirrors `App\Http\Resources\WorkspaceInvitationResource`. No token field, by design. */
export type WorkspaceInvitation = {
    id: number;
    workspace_id: number;
    email: string;
    /** ISO timestamp. Expired rows are still returned — the backend filters on acceptance only. */
    expires_at: string;
};

/** Mirrors `App\Http\Resources\WorkspaceMemberResource`. */
export type WorkspaceMember = {
    id: number;
    name: string;
    email: string;
    is_owner: boolean;
    /** Pivot column `workspace_user.joined_at`, serialised as an ISO timestamp. */
    joined_at: string;
};


/**
 * Mirrors `App\Http\Resources\WorkspaceInvitationPreviewResource`.
 *
 * Served unauthenticated to whoever holds the link, so it is deliberately thinner than
 * `WorkspaceInvitation` — enough to say what the invite is for, and nothing else.
 */
export type WorkspaceInvitationPreview = {
    email: string;
    expires_at: string;
    workspace: {
        id: number;
        name: string;
        avatar: string | null;
    };
    invited_by: string | null;
};
