import BackButton from '@/app/_components/backButton';

export default function AlgorithmLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
        Layout
        <BackButton />
        {children}
        </>
    );
}