import clsx from "clsx";
import { PropsWithChildren } from "react";

export default function Button({ children, onClick = () => {}, disabled = false, className }: PropsWithChildren<{ onClick?: () => void, disabled?: boolean, className?: string }>) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={clsx(`cursor-pointer flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium px-3 py-2 transition-colors`, disabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-900 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500", className)}
        >
            {children}
        </button>
    )
}