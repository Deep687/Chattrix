/**
 * Cross-tab auth announcements. The session cookie is shared by the whole browser but each tab
 * keeps its own user in Redux, so a login elsewhere leaves this tab showing the previous tenant.
 */

type AuthMessage = {
    type: "LOGIN" | "LOGOUT";
    userId?: number;
};

const authChannel = new BroadcastChannel("auth");

export function broadcastLogin(userId: number) {
    const message: AuthMessage = { type: "LOGIN", userId };

    
    authChannel.postMessage(message);
}

export function broadcastLogout() {
    const message: AuthMessage = { type: "LOGOUT" };
 
    authChannel.postMessage(message); 
}

/** The sending tab never receives its own message, so a subscriber only hears other tabs. */
export function subscribeToAuthChanges(callback: (message: AuthMessage) => void) {
    function handleMessage(event: MessageEvent) {
        callback(event.data);
    }

    authChannel.addEventListener("message", handleMessage);

    return function unsubscribe() {
        authChannel.removeEventListener("message", handleMessage);
    };
}
