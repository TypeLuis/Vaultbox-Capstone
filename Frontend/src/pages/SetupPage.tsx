import React, { useState } from 'react'
import classes from '../styles/SetupPage.module.scss'

type OS = 'windows' | 'mac' | 'linux'

interface Step {
    label: string
    command: string
    comment?: string
}

const steps: Record<OS, Step[]> = {
    windows: [
        { label: 'Clone the repository', command: 'git clone https://github.com/TypeLuis/Vaultbox.git', comment: '# clone repo' },
        { label: 'Enter the directory', command: 'cd Vaultbox', comment: '# navigate in' },
        { label: 'Install dependencies', command: 'npm install', comment: '# install packages' },
        { label: 'Install Services', command: 'npm run initialize', comment: '# Installs needed services and setup env' },
        { label: 'Start the dev server', command: 'npm run dev', comment: '# launch' },
    ],
    mac: [
        { label: 'Clone the repository', command: 'git clone https://github.com/TypeLuis/Vaultbox.git', comment: '# clone repo' },
        { label: 'Enter the directory', command: 'cd Vaultbox', comment: '# navigate in' },
        { label: 'Install dependencies', command: 'npm install', comment: '# install packages' },
        { label: 'Install Services', command: 'sudo npm run initialize', comment: '# Installs needed services and setup env' },
        { label: 'Start the dev server', command: 'sudo npm run dev', comment: '# launch' },
    ],
    linux: [
        { label: 'Clone the repository', command: 'git clone https://github.com/TypeLuis/Vaultbox.git', comment: '# clone repo' },
        { label: 'Enter the directory', command: 'cd Vaultbox', comment: '# navigate in' },
        { label: 'Install dependencies', command: 'npm install', comment: '# install packages' },
        { label: 'Install Services', command: 'sudo npm run initialize', comment: '# Installs needed services and setup env' },
        { label: 'Start the dev server', command: 'sudo npm run dev', comment: '# launch' },
    ],
}

const osLabels: Record<OS, { label: string; icon: string; shell: string }> = {
    windows: { label: 'Windows', icon: '🪟', shell: 'powershell' },
    mac: { label: 'macOS', icon: '🖥️', shell: 'zsh' },
    linux: { label: 'Linux', icon: '🐧', shell: 'bash' },
}

const SetupPage: React.FC = () => {
    const [activeOS, setActiveOS] = useState<OS>('windows')
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

    const handleCopy = (text: string, index: number) => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                setCopiedIndex(index)
                setTimeout(() => setCopiedIndex(null), 2000)
            })
        } else {
            // Fallback for non-secure contexts
            const textarea = document.createElement('textarea')
            textarea.value = text
            textarea.style.position = 'fixed'
            textarea.style.opacity = '0'
            document.body.appendChild(textarea)
            textarea.focus()
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
            setCopiedIndex(index)
            setTimeout(() => setCopiedIndex(null), 2000)
        }
    }

    return (
        <div className={classes.page}>
            {/* Ambient background grid */}
            <div className={classes.grid} aria-hidden="true" />
            <div className={classes.glow} aria-hidden="true" />

            <div className={classes.container}>
                <header className={classes.header}>
                    <div className={classes.badge}>QUICK START</div>
                    <h1 className={classes.title}>
                        Get up and running<br />
                        <span className={classes.accent}>in minutes.</span>
                    </h1>
                    <p className={classes.subtitle}>
                        Follow the steps below to spin up your local VaultBox instance.
                        No cloud required.
                    </p>
                </header>

                {/* OS Tabs */}
                <div className={classes.tabs}>
                    {(Object.keys(osLabels) as OS[]).map((os) => (
                        <button
                            key={os}
                            className={`${classes.tab} ${activeOS === os ? classes.tabActive : ''}`}
                            onClick={() => setActiveOS(os)}
                        >
                            <span className={classes.tabIcon}>{osLabels[os].icon}</span>
                            {osLabels[os].label}
                        </button>
                    ))}
                    <div className={classes.shellBadge}>{osLabels[activeOS].shell}</div>
                </div>

                {/* Steps */}
                <div className={classes.steps}>
                    {steps[activeOS].map((step, i) => (
                        <div key={i} className={classes.step}>
                            <div className={classes.stepMeta}>
                                <span className={classes.stepNumber}>0{i + 1}</span>
                                <span className={classes.stepLabel}>{step.label}</span>
                            </div>
                            <div className={classes.codeBlock}>
                                <span className={classes.prompt}>$</span>
                                <code className={classes.command}>{step.command}</code>
                                {step.comment && (
                                    <span className={classes.comment}>{step.comment}</span>
                                )}
                                <button
                                    className={`${classes.copyBtn} ${copiedIndex === i ? classes.copied : ''}`}
                                    onClick={() => handleCopy(step.command, i)}
                                    aria-label="Copy command"
                                >
                                    {copiedIndex === i ? (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    ) : (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <footer className={classes.footer}>
                    <span className={classes.footerDot} />
                    Once running, open{' '}
                    <code className={classes.url}>http://localhost:5173</code>
                    {' '}in your browser.
                </footer>
            </div>
        </div>
    )
}

export default SetupPage