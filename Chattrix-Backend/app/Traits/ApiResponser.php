<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponser
{
    protected function success(
        $data = null,
        int $statusCode = 200,
        string $message = 'Success',
        $token = null
    ): JsonResponse {

        $response = [
            'data' => $data,
            'statusCode' => $statusCode,
            'message' => $message
        ];

        if ($token) {
            $response['token'] = $token;
        }

        return response()->json($response, $statusCode);
    }

    protected function error(
        $data = null,
        int $statusCode = 400,
        string $message = 'Error',
        $token = null
    ): JsonResponse {

        $response = [
            'data' => $data,
            'statusCode' => $statusCode,
            'message' => $message
        ];

        if ($token) {
            $response['token'] = $token;
        }

        return response()->json($response, $statusCode);
    }
}
