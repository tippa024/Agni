
const CurrentStepAndTime = ({ messageComponentIndex, currentProcessingStep, font }: { messageComponentIndex: number, currentProcessingStep: string | undefined, font: { className: string } }) => {
    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
                <div className="text-sm font-mono mr-2 font-semibold uppercase tracking-wide text-[#2C2C2C]">AGNI {messageComponentIndex}</div>
                {
                    currentProcessingStep && currentProcessingStep !== '' &&
                    (
                        <div className="flex items-center gap-2">
                            <span className={`text-xs text-[#c5bca7] ${font.className}`}>
                                {currentProcessingStep}
                            </span>
                            <span className="flex gap-1">
                                {[0, 0.3, 0.6].map((delay) => (
                                    <span
                                        key={delay}
                                        className="h-1 w-1 rounded-full bg-[#b5b4b2] animate-pulse"
                                        style={{ animationDelay: `${delay}s` }}
                                    />
                                ))}
                            </span>
                        </div>
                    )}
            </div>
            <div className='text-xs text-[#2C2C2C]/50 font-mono'>
                {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
        </div>
    )
}

export default CurrentStepAndTime;