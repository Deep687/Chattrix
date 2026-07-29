/** Mirrors `App\Http\Resources\WorkspaceResource`. */
export type Workspace = {
    id: number;
    name: string;
    description: string | null;
    avatar: string | null;
    owner_id: number;
    /**
     * The caller's tenant role. Optional because the backend uses `whenPivotLoaded`, so it is
     * present on the listing (loaded through the membership pivot) and absent on a freshly
     * created workspace. An absent key is honest; a guessed default would not be.
     */
    role?: string;
    created_at: string;
};

/** Envelope produced by `App\Traits\ApiResponser`. */
export type ApiResponse<T> = {
    data: T;
    statusCode: number;
    message: string;
};
