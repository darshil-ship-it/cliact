'use client';
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
function Parallax({ children, className }: {
    children: React.ReactNode;
    className: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
    const y = useTransform(scrollYProgress, [0, 1], [16, -16]);
    return <motion.div ref={ref} className={className} style={{ y }}>{children}</motion.div>;
}
export function Reveal({ children, preset = 'fade-up', className = '' }: {
    children: React.ReactNode;
    preset?: string;
    className?: string;
}) {
    const reduced = useReducedMotion();
    if (preset === 'parallax' && !reduced)
        return <Parallax className={className}>{children}</Parallax>;
    const off = reduced || preset === 'none';
    return <motion.div className={`${className} ${preset === 'stagger' ? 'stagger-reveal' : ''}`} initial={off ? false : { opacity: 0, y: preset === 'fade-up' || preset === 'stagger' ? 20 : 0, x: preset === 'slide-left' ? 24 : preset === 'slide-right' ? -24 : 0, scale: preset === 'scale' ? .97 : 1, clipPath: preset === 'reveal' ? 'inset(0 0 12% 0)' : 'inset(0 0 0% 0)' }} whileInView={{ opacity: 1, y: 0, x: 0, scale: 1, clipPath: 'inset(0 0 0% 0)' }} viewport={{ once: true, amount: .08 }} transition={{ duration: .55, ease: [.22, 1, .36, 1] }}>{children}</motion.div>;
}
