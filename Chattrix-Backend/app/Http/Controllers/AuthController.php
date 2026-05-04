<?php

namespace App\Http\Controllers;

class AuthController extends Controller
{

public function register(){
    return response()->json([
        'message' => "Register endpoint is under construction.",
        'success' => false,
    ]);
}
}
