"use client"
import { Form } from "informed";
import Input from "@/src/components/Input";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/src/firebase/firebase";

import { type FormState } from "informed";

import Swal from "sweetalert2";

import { LogoIcon } from "@/src/components/Icons/icons";

import { useRouter, useSearchParams } from 'next/navigation'

export default function ServicesPage() {

    const router = useRouter()

    const handleLogin = async (formState: FormState) => {

        const { values: {
            email,
            password
        } } = formState;

        try {
            await signInWithEmailAndPassword(
                auth,
                (email as string),
                (password as string),
            );

            router.push('/dashboard/')

        } catch (error: any) {
            console.error("CODE:", error.code);
            console.error("MESSAGE:", error.message);
            console.error(error);

            await Swal.fire({
                icon: "error",
                html: error.messag,
                confirmButtonColor: "#000",
                scrollbarPadding: false,
                didClose: () => {
                    document.body.style.overflow = "hidden";
                    document.body.style.paddingRight = "0px";
                }
            });
        }
    };
    return (
        <div className="h-[100dvh] w-full flex justify-center items-center p-4">
            <Form
                className="bg-[#7b8d85] w-[30rem] p-8 grid gap-4 rounded-sm"
                onSubmit={handleLogin}
            >
                <LogoIcon className="w-40 mx-auto" />
                <Input placeholder="Email" identifier="email" />
                <Input placeholder="password" identifier="password" type={'password'} />
                <button className="bg-[#F5F2ED] rounded-full p-2">
                    Entrar
                </button>
            </Form>
        </div>
    )
}