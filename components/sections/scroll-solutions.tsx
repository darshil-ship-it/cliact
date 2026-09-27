'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
    Activity,
    ArrowRight,
    BarChart3,
    CalendarDays,
    Check,
    CircleDollarSign,
    ClipboardCheck,
    Clock3,
    FileText,
    Lightbulb,
    Mail,
    MessageSquareText,
    PhoneCall,
    Send,
    Sparkles,
    UserRoundCheck,
    WandSparkles,
} from 'lucide-react';
import { Content, strings, text } from '@/types/cms';
import { contentMediaUrl } from '@/lib/validators';
import { Media } from './media';
import styles from './scroll-solutions.module.css';

const featureIcons = [FileText, WandSparkles, MessageSquareText, CircleDollarSign, BarChart3];

function NotesMockup() {
    return <div className={styles.notesGrid}>
        <div className={styles.transcript}>
            <div className={styles.mockHeading}><span>Live transcript</span><span className={styles.liveDot}>Listening</span></div>
            <p><b>Clinician</b> How did the home exercises feel this week?</p>
            <p><b>Patient</b> The stairs are easier. I still notice stiffness first thing in the morning.</p>
            <p className={styles.typing}><span/>Capturing the conversation…</p>
        </div>
        <div className={styles.clinicalNote}>
            <div className={styles.mockHeading}><span>Progress note</span><span className={styles.draftBadge}>Draft</span></div>
            <div><small>SUBJECTIVE</small><p>Reports improved stair tolerance with residual morning stiffness.</p></div>
            <div><small>PLAN</small><p>Continue graded loading and review mobility at next visit.</p></div>
            <button type="button"><ClipboardCheck size={14}/> Review note</button>
        </div>
    </div>;
}

function AssistantMockup() {
    return <div className={styles.workflowMock}>
        <div className={styles.dayHeader}><div><small>TODAY · CLIACT PRACTICE</small><strong>Tuesday, 14 October</strong></div><span><CalendarDays size={15}/> 7 appointments</span></div>
        <div className={styles.timelineRows}>
            <div><time>09:00</time><span className={styles.avatar}>JM</span><p><b>Jamie Morgan</b><small>Knee rehabilitation · 45 min</small></p><span className={styles.ready}>Ready</span></div>
            <div><time>10:00</time><span className={styles.avatar}>AR</span><p><b>Alex Rivera</b><small>Shoulder review · 30 min</small></p><span>Confirmed</span></div>
        </div>
        <div className={styles.suggestion}><Lightbulb size={18}/><div><small>CLIACT SUGGESTION</small><b>Jamie’s outcome measure is due today.</b><p>Add it to the pre-session checklist?</p></div><button type="button">Add task</button></div>
    </div>;
}

function SchedulingMockup() {
    return <div className={styles.workflowMock}>
        <div className={styles.dayHeader}><div><small>WEDNESDAY SCHEDULE</small><strong>Keep the clinic day moving</strong></div><span><CalendarDays size={15}/> 2 openings</span></div>
        <div className={styles.scheduleBoard}>
            <div><time>10:00</time><span className={styles.avatar}>AR</span><p><b>Alex Rivera</b><small>Shoulder review · Room 2</small></p><span className={styles.ready}>Confirmed</span></div>
            <div><time>11:15</time><span className={styles.avatar}>SK</span><p><b>Samira Khan</b><small>Initial assessment · Room 1</small></p><span>Check in due</span></div>
            <div className={styles.openSlot}><time>14:30</time><span>Open appointment</span><button type="button">Offer to waitlist</button></div>
        </div>
        <div className={styles.suggestion}><Lightbulb size={18}/><div><small>CLIACT SUGGESTION</small><b>Jordan can take the 14:30 opening.</b><p>Prepare a message for reception to review?</p></div><button type="button">Prepare</button></div>
    </div>;
}

function CommunicationMockup() {
    return <div className={styles.communicationMock}>
        <div className={styles.inboxList}>
            <div className={styles.mockHeading}><span>Clinic inbox</span><span className={styles.draftBadge}>3 new</span></div>
            <button type="button" className={styles.activeMessage}><span className={styles.avatar}>JM</span><span><b>Jamie Morgan</b><small>Question about tomorrow</small></span><time>09:42</time></button>
            <button type="button"><span className={styles.avatar}>AR</span><span><b>Alex Rivera</b><small>Exercise clarification</small></span><time>08:18</time></button>
            <button type="button"><span className={styles.avatar}>SK</span><span><b>Samira Khan</b><small>Appointment request</small></span><time>Tue</time></button>
        </div>
        <div className={styles.conversationPane}>
            <div className={styles.mockHeading}><span>Jamie Morgan</span><span>SMS</span></div>
            <div className={styles.patientBubble}>Should I still come in tomorrow if my calf is a little sore?</div>
            <div className={styles.replyDraft}><small>SUGGESTED REPLY · REVIEW REQUIRED</small><p>Hi Jamie, thanks for checking in. Please keep the exercises comfortable today. We can review the soreness together at tomorrow’s appointment.</p></div>
            <div className={styles.messageActions}><button type="button">Edit reply</button><button type="button" className={styles.primaryAction}>Approve <Send size={13}/></button></div>
        </div>
    </div>;
}

function ReceptionMockup() {
    return <div className={styles.receptionMock}>
        <div className={styles.receptionSummary}>
            <div><span className={styles.callIcon}><PhoneCall size={17}/></span><span><small>INCOMING CALL</small><b>New patient enquiry</b></span><span className={styles.liveDot}>Live</span></div>
            <p>“I’m looking for help with a knee injury and would prefer an appointment after work.”</p>
        </div>
        <div className={styles.intakeCard}>
            <div className={styles.mockHeading}><span>Suggested reception workflow</span><span className={styles.draftBadge}>Draft</span></div>
            <div className={styles.intakeSteps}>
                <div><UserRoundCheck size={16}/><span><b>Capture patient details</b><small>Name, contact preference, and reason for visit</small></span><Check size={14}/></div>
                <div><CalendarDays size={16}/><span><b>Offer suitable appointments</b><small>Two evening openings found this week</small></span><Check size={14}/></div>
                <div><Mail size={16}/><span><b>Prepare intake information</b><small>Ready for reception to review and send</small></span><ArrowRight size={14}/></div>
            </div>
            <button type="button" className={styles.reviewWorkflow}>Review next steps</button>
        </div>
    </div>;
}

function FollowupMockup() {
    return <div className={styles.messageMock}>
        <div className={styles.messageTop}><div><span className={styles.avatar}>JM</span><div><b>Jamie Morgan</b><small>Post-session follow-up</small></div></div><span className={styles.draftBadge}>Needs review</span></div>
        <div className={styles.messageBody}>
            <small>DRAFT MESSAGE</small>
            <p>Hi Jamie, it was good to see you today. Keep the new calf raises comfortable and steady. If the soreness lasts longer than expected, reply here and we can adjust the plan.</p>
            <div className={styles.exercisePill}><Activity size={15}/><span><b>Standing calf raise</b><small>3 sets · comfortable pace</small></span></div>
        </div>
        <div className={styles.messageActions}><button type="button">Edit draft</button><button type="button" className={styles.primaryAction}>Approve &amp; send <ArrowRight size={14}/></button></div>
    </div>;
}

function OperationsMockup() {
    return <div className={styles.operationsMock}>
        <div className={styles.statRow}>
            <div><CalendarDays size={17}/><span>Appointments today</span><strong>7</strong><small>6 confirmed</small></div>
            <div><Clock3 size={17}/><span>Awaiting notes</span><strong>2</strong><small>Review before close</small></div>
            <div><CircleDollarSign size={17}/><span>Claims to review</span><strong>3</strong><small>No overdue items</small></div>
        </div>
        <div className={styles.billingTable}>
            <div className={styles.mockHeading}><span>Appointment &amp; billing queue</span><button type="button">View schedule</button></div>
            <div className={styles.tableHead}><span>Patient</span><span>Appointment</span><span>Billing</span></div>
            <div><span><b>Jamie Morgan</b><small>Lower limb rehab</small></span><span>09:00 · Complete</span><span className={styles.ready}>Ready</span></div>
            <div><span><b>Alex Rivera</b><small>Shoulder review</small></span><span>10:00 · Upcoming</span><span className={styles.review}>Check code</span></div>
        </div>
    </div>;
}

function InsightsMockup() {
    const bars = [42, 58, 51, 73, 68, 84, 77];
    return <div className={styles.insightsMock}>
        <div className={styles.insightHeader}><div><small>PRACTICE ACTIVITY</small><strong>A steady week of care</strong></div><span>Last 7 days</span></div>
        <div className={styles.chartArea} aria-label="Sample chart showing practice activity over seven days">
            {bars.map((height, index) => <div key={index}><span style={{ height: `${height}%` }}/><small>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</small></div>)}
        </div>
        <div className={styles.insightCards}>
            <div><Sparkles size={17}/><span><b>Follow-ups are moving well</b><small>Most drafts were reviewed on the same day.</small></span></div>
            <div><Clock3 size={17}/><span><b>Protect Thursday afternoon</b><small>It has the highest documentation load this week.</small></span></div>
        </div>
    </div>;
}

function ProductMockup({ kind }: { kind: string }) {
    return <div className={styles.productWindow}>
        <div className={styles.productBar}><div><span className={styles.brandMark}>C</span><b>Cliact</b></div><span>Example physiotherapy workspace</span><span className={styles.userDot}>AL</span></div>
        <div className={styles.productCanvas}>
            {kind === 'notes' ? <NotesMockup/> : kind === 'assistant' ? <AssistantMockup/> : kind === 'scheduling' ? <SchedulingMockup/> : kind === 'communication' ? <CommunicationMockup/> : kind === 'reception' ? <ReceptionMockup/> : kind === 'followups' ? <FollowupMockup/> : kind === 'operations' ? <OperationsMockup/> : <InsightsMockup/>}
        </div>
    </div>;
}

function FeaturePanel({ item, index, panelId }: { item: Content; index: number; panelId: string }) {
    const Icon = featureIcons[index % featureIcons.length];
    const benefits = strings(item, 'benefits');
    const customMedia = contentMediaUrl(item);
    return <article className={styles.panel} id={panelId} aria-labelledby={`${panelId}-title`}>
        <div className={styles.panelCopy}>
            <span className={styles.panelIcon}><Icon size={20}/></span>
            <div><span className={styles.panelCount}>{String(index + 1).padStart(2, '0')}</span><h3 id={`${panelId}-title`}>{text(item, 'title')}</h3></div>
            <p>{text(item, 'description')}</p>
            <ul>{benefits.map(benefit => <li key={benefit}><Check size={14}/>{benefit}</li>)}</ul>
        </div>
        {customMedia ? <div className={styles.customMedia}><Media data={item} mode={text(item, 'title')}/></div> : <ProductMockup kind={text(item, 'visual', 'notes')}/>} 
    </article>;
}

export function ScrollSolutionsSection({ data, items }: { data: Content; items: Content[] }) {
    const [active, setActive] = useState(0);
    const trackRef = useRef<HTMLDivElement>(null);
    const reduced = useReducedMotion();
    const sectionId = useId().replaceAll(':', '');

    useEffect(() => {
        if (!items.length) return;
        let frame = 0;
        const update = () => {
            frame = 0;
            const track = trackRef.current;
            if (!track || window.matchMedia('(max-width: 800px)').matches) return;
            const rect = track.getBoundingClientRect();
            const stickyTop = Math.min(132, window.innerHeight * .18);
            const range = Math.max(1, rect.height - window.innerHeight + stickyTop);
            const progress = Math.max(0, Math.min(1, (stickyTop - rect.top) / range));
            const next = Math.min(items.length - 1, Math.floor(progress * items.length));
            setActive(previous => previous === next ? previous : next);
        };
        const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
        update();
        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate);
        return () => {
            window.removeEventListener('scroll', requestUpdate);
            window.removeEventListener('resize', requestUpdate);
            if (frame) cancelAnimationFrame(frame);
        };
    }, [items.length]);

    const goTo = (index: number) => {
        setActive(index);
        const track = trackRef.current;
        if (!track) return;
        const stickyTop = Math.min(132, window.innerHeight * .18);
        const range = Math.max(1, track.offsetHeight - window.innerHeight + stickyTop);
        const top = track.getBoundingClientRect().top + window.scrollY - stickyTop + range * (index / items.length + .01);
        window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
    };

    const onNavKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
        let next = index;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = Math.min(items.length - 1, index + 1);
        else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = Math.max(0, index - 1);
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = items.length - 1;
        else return;
        event.preventDefault();
        goTo(next);
        document.getElementById(`${sectionId}-feature-${next}`)?.focus({ preventScroll: true });
    };

    if (!items.length) return null;
    return <div className={styles.solutions}>
        <div className={styles.desktopGrid}>
            <aside className={styles.stickyIntro}>
                <span className="eyebrow">{text(data, 'eyebrow')}</span>
                <h2>{text(data, 'heading')}</h2>
                <p>{text(data, 'description')}</p>
                <nav className={styles.featureNav} aria-label="Cliact Health solutions">
                    {items.map((item, index) => {
                        const Icon = featureIcons[index % featureIcons.length];
                        return <button
                            type="button"
                            id={`${sectionId}-feature-${index}`}
                            key={text(item, 'title', String(index))}
                            aria-current={active === index ? 'step' : undefined}
                            aria-controls={`${sectionId}-panel-${index}`}
                            onClick={() => goTo(index)}
                            onKeyDown={event => onNavKeyDown(event, index)}
                        >
                            <span className={styles.navProgress}><i style={{ transform: `scaleY(${active === index ? 1 : 0})` }}/></span>
                            <Icon size={18}/><span><b>{text(item, 'title')}</b><small>{text(item, 'nav_label')}</small></span><span className={styles.navNumber}>{String(index + 1).padStart(2, '0')}</span>
                        </button>;
                    })}
                </nav>
            </aside>
            <div ref={trackRef} className={styles.track} style={{ '--feature-count': items.length } as React.CSSProperties}>
                <div className={styles.stickyStage}>
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={active}
                            initial={reduced ? false : { opacity: 0, y: 22 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduced ? undefined : { opacity: 0, y: -14 }}
                            transition={{ duration: reduced ? 0 : .32, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <FeaturePanel item={items[active]} index={active} panelId={`${sectionId}-panel-${active}`}/>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
        <div className={styles.mobileStack}>
            <div className={styles.mobileHeading}><span className="eyebrow">{text(data, 'eyebrow')}</span><h2>{text(data, 'heading')}</h2><p>{text(data, 'description')}</p></div>
            {items.map((item, index) => <FeaturePanel key={text(item, 'title', String(index))} item={item} index={index} panelId={`${sectionId}-mobile-panel-${index}`}/>)}
        </div>
    </div>;
}
