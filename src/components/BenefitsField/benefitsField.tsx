"use client"
import { useState } from "react";
import { useField } from "informed";
import Input from "@/src/components/Input";
import Textarea from "@/src/components/Textarea";
import styles from "./benefitsField.module.css";
import { TrashIcon } from "../Icons/icons";
import { CallbackFunction } from "../Input/types";
import Message from "@/src/components/Message";

type Benefit = {
    title: string;
    description: string;
};

const BenefitsField = ({ name = "benefits", title = 'Beneficios', validate }: { name: string, title?: string, validate?: CallbackFunction }) => {

    const { fieldState } = useField({
        name,
        validate
    });

    const [benefits, setBenefits] = useState<Benefit[]>(
        Array.isArray(fieldState?.value) ? (fieldState.value as Benefit[]) : []
    );

    const addBenefit = () => {
        setBenefits(prev => [
            ...prev,
            {
                title: "",
                description: "",
            },
        ]);
    };

    const removeBenefit = (index: number) => {
        setBenefits(benefits.filter((_: any, i: number) => i !== index));
    };

    return (
        <div className={styles.root}>
            <div className={styles.header}>
                <label>{title}</label>
                <button
                    type="button"
                    onClick={addBenefit}
                    className={styles.addButton}
                >
                    Agregar
                </button>
            </div>

            <div className={styles.list}>
                {benefits.map((_: any, index: number) => (
                    <div key={index} className={styles.card}>
                        <Input
                            identifier={`${name}[${index}].title`}
                            label="Título"
                        />

                        <Textarea
                            type={'text'}
                            identifier={`${name}[${index}].description`}
                            label="Descripción"
                        />

                        <button
                            type="button"
                            onClick={() => removeBenefit(index)}
                            className={styles.removeButton}
                        >
                            <TrashIcon className="size-6 stroke-red-500" />
                        </button>
                    </div>
                ))}
            </div>
            <Message field={name} />
        </div>
    );
};

export default BenefitsField;