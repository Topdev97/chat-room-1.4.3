import Sidebar from "@/components/layout/Sidebar";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { usePageStore } from "@/stores/page";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import Head from "next/head";
import { ReactNode } from "react";

export function AppLayout({
    title,
    children,
}: {
    title: string;
    children?: ReactNode;
}) {
    return (
        <>
            <Head>
                <title>Create Next App</title>
                <meta
                    name="description"
                    content="Generated by create next app"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="grid grid-cols-1 md:grid-cols-[20rem_auto] min-h-screen text-accent-900 dark:text-accent-50">
                <Sidebar />
                <div className="flex flex-col bg-light-100 dark:bg-dark-900 p-4">
                    <Navbar title={title} />
                    {children}
                </div>
            </main>
        </>
    );
}

function Navbar({ title }: { title: string }) {
    const [setSidebarOpen] = usePageStore((v) => [v.setSidebarOpen]);

    return (
        <div className="flex flex-row gap-2 items-center">
            <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
                <HamburgerMenuIcon className="w-6 h-6" />
            </button>
            <p className="font-bold text-xl md:text-2xl">{title}</p>
            <div className="ml-auto">
                <ThemeSwitch />
            </div>
        </div>
    );
}
