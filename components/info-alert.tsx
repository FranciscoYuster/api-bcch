import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface InfoAlertProps {
    title: string
    description: string
}

export default function InfoAlert({ title, description }: InfoAlertProps) {
    return (
        <div className="flex p-6">
            <Alert variant="default" className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-800 dark:text-blue-300">{title}</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-400">{description}</AlertDescription>
            </Alert>
        </div>
    )
}