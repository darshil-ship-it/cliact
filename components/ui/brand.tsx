import Link from 'next/link';
export function Brand({ logo = '', small = false }: {
    logo?: string;
    small?: boolean;
}) { return <Link href="/" className={`brand ${small ? 'brand-small' : ''}`} aria-label="Cliact Health home">{logo ? <img src={logo} alt="Cliact Health" width={160} height={36}/> : <><span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span><span>Cliact<span className="brand-health"> Health</span></span></>}</Link>; }
