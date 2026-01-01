import { Spinner } from "./ui/spinner";

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center text-white bg-background">
            <div className="flex flex-col items-center space-y-4">
                <Spinner className="size-13" />
            </div>
        </div>
    );
}
