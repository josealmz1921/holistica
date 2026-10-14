import { auth } from "./firebase";

export async function adminHeaders(): Promise<Record<string, string>> {
    const user = auth.currentUser;
    if (!user) throw new Error("Inicia sesión para continuar.");
    const token = await user.getIdTokenResult();
    if (token.claims.admin !== true) throw new Error("No tienes permisos de administrador.");
    return { "Content-Type": "application/json", Authorization: `Bearer ${token.token}` };
}
