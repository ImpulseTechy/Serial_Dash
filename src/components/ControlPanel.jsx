import { useState } from 'react'
import { useSerialStore } from '../store/serialStore'

function ControlPanel({ isConnected, onClose, onSend }) {
  const controls = useSerialStore((state) => state.controls)
  const addControl = useSerialStore((state) => state.addControl)
  const removeControl = useSerialStore((state) => state.removeControl)
  const updateControl = useSerialStore((state) => state.updateControl)

  const [commandText, setCommandText] = useState('')
  const [recentSends, setRecentSends] = useState([])
  const [showButtonForm, setShowButtonForm] = useState(false)
  const [showSliderForm, setShowSliderForm] = useState(false)
  const [buttonDraft, setButtonDraft] = useState({ label: '', payload: '' })
  const [sliderDraft, setSliderDraft] = useState({
    label: '',
    template: '{value}',
    min: 0,
    max: 255,
    step: 1,
    value: 0,
  })

  function logSend(payload) {
    setRecentSends((current) =>
      [{ payload, time: new Date() }, ...current].slice(0, 6),
    )
  }

  async function handleSendCommand() {
    if (!commandText.trim()) {
      return
    }
    const sent = await onSend(commandText)
    if (sent) {
      logSend(commandText)
      setCommandText('')
    }
  }

  async function handleButtonPress(control) {
    const sent = await onSend(control.payload)
    if (sent) {
      logSend(control.payload)
    }
  }

  function handleSliderChange(control, rawValue) {
    const value = Number(rawValue)
    updateControl(control.id, { value })
  }

  async function handleSliderRelease(control) {
    const payload = (control.template || '{value}').replaceAll(
      '{value}',
      String(control.value),
    )
    const sent = await onSend(payload)
    if (sent) {
      logSend(payload)
    }
  }

  function handleAddButton() {
    if (!buttonDraft.label.trim() || !buttonDraft.payload.trim()) {
      return
    }
    addControl({
      type: 'button',
      label: buttonDraft.label.trim(),
      payload: buttonDraft.payload,
    })
    setButtonDraft({ label: '', payload: '' })
    setShowButtonForm(false)
  }

  function handleAddSlider() {
    if (!sliderDraft.label.trim() || !sliderDraft.template.includes('{value}')) {
      return
    }
    const min = Number(sliderDraft.min)
    const max = Number(sliderDraft.max)
    const step = Number(sliderDraft.step) || 1
    addControl({
      type: 'slider',
      label: sliderDraft.label.trim(),
      template: sliderDraft.template,
      min,
      max,
      step,
      value: Math.min(max, Math.max(min, Number(sliderDraft.value) || min)),
    })
    setSliderDraft({
      label: '',
      template: '{value}',
      min: 0,
      max: 255,
      step: 1,
      value: 0,
    })
    setShowSliderForm(false)
  }

  const buttonControls = controls.filter((control) => control.type === 'button')
  const sliderControls = controls.filter((control) => control.type === 'slider')

  return (
    <aside className="flex h-full w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div>
          <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100">
            Send to Device
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isConnected
              ? 'Commands are sent over the serial port'
              : 'Connect a serial port to enable sending'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close control panel"
          className="grid size-8 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          x
        </button>
      </header>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Command Line
          </h3>
          <div className="flex gap-2">
            <input
              className="h-10 flex-1 rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-cyan-950"
              placeholder="LED_ON"
              value={commandText}
              disabled={!isConnected}
              onChange={(event) => setCommandText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSendCommand()
                }
              }}
            />
            <button
              type="button"
              onClick={handleSendCommand}
              disabled={!isConnected || !commandText.trim()}
              className="rounded-lg bg-cyan-600 px-4 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
            >
              Send
            </button>
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Buttons
            </h3>
            <button
              type="button"
              onClick={() => setShowButtonForm((value) => !value)}
              className="text-xs font-semibold text-cyan-700 hover:underline dark:text-cyan-400"
            >
              {showButtonForm ? 'Cancel' : '+ Add Button'}
            </button>
          </div>

          {showButtonForm && (
            <div className="mb-3 space-y-2 rounded-lg border border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
              <input
                className="h-9 w-full rounded border border-slate-300 bg-white px-2 text-sm outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Button label (e.g. LED on)"
                value={buttonDraft.label}
                onChange={(event) =>
                  setButtonDraft((current) => ({
                    ...current,
                    label: event.target.value,
                  }))
                }
              />
              <input
                className="h-9 w-full rounded border border-slate-300 bg-white px-2 font-mono text-sm outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Payload to send (e.g. LED_ON)"
                value={buttonDraft.payload}
                onChange={(event) =>
                  setButtonDraft((current) => ({
                    ...current,
                    payload: event.target.value,
                  }))
                }
              />
              <button
                type="button"
                onClick={handleAddButton}
                className="w-full rounded bg-slate-950 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              >
                Save Button
              </button>
            </div>
          )}

          {buttonControls.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No custom buttons yet
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {buttonControls.map((control) => (
                <div
                  key={control.id}
                  className="group relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <button
                    type="button"
                    disabled={!isConnected}
                    onClick={() => handleButtonPress(control)}
                    className="w-full px-3 py-3 text-left text-sm font-semibold text-slate-800 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-100 dark:hover:bg-cyan-950/40"
                    title={control.payload}
                  >
                    <div>{control.label}</div>
                    <div className="mt-0.5 truncate font-mono text-xs text-slate-500 dark:text-slate-400">
                      {control.payload}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeControl(control.id)}
                    aria-label={`Remove ${control.label}`}
                    className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 opacity-0 transition group-hover:opacity-100 hover:bg-rose-500 hover:text-white dark:bg-slate-800 dark:text-slate-200"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sliders
            </h3>
            <button
              type="button"
              onClick={() => setShowSliderForm((value) => !value)}
              className="text-xs font-semibold text-cyan-700 hover:underline dark:text-cyan-400"
            >
              {showSliderForm ? 'Cancel' : '+ Add Slider'}
            </button>
          </div>

          {showSliderForm && (
            <div className="mb-3 space-y-2 rounded-lg border border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950">
              <input
                className="h-9 w-full rounded border border-slate-300 bg-white px-2 text-sm outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Slider label (e.g. Motor PWM)"
                value={sliderDraft.label}
                onChange={(event) =>
                  setSliderDraft((current) => ({
                    ...current,
                    label: event.target.value,
                  }))
                }
              />
              <input
                className="h-9 w-full rounded border border-slate-300 bg-white px-2 font-mono text-sm outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Payload template, use {value}"
                value={sliderDraft.template}
                onChange={(event) =>
                  setSliderDraft((current) => ({
                    ...current,
                    template: event.target.value,
                  }))
                }
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  className="h-9 w-full rounded border border-slate-300 bg-white px-2 text-sm outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  type="number"
                  placeholder="Min"
                  value={sliderDraft.min}
                  onChange={(event) =>
                    setSliderDraft((current) => ({
                      ...current,
                      min: event.target.value,
                    }))
                  }
                />
                <input
                  className="h-9 w-full rounded border border-slate-300 bg-white px-2 text-sm outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  type="number"
                  placeholder="Max"
                  value={sliderDraft.max}
                  onChange={(event) =>
                    setSliderDraft((current) => ({
                      ...current,
                      max: event.target.value,
                    }))
                  }
                />
                <input
                  className="h-9 w-full rounded border border-slate-300 bg-white px-2 text-sm outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  type="number"
                  placeholder="Step"
                  value={sliderDraft.step}
                  onChange={(event) =>
                    setSliderDraft((current) => ({
                      ...current,
                      step: event.target.value,
                    }))
                  }
                />
              </div>
              <button
                type="button"
                onClick={handleAddSlider}
                className="w-full rounded bg-slate-950 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              >
                Save Slider
              </button>
            </div>
          )}

          {sliderControls.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 px-3 py-4 text-center text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
              No sliders yet
            </p>
          ) : (
            <div className="space-y-3">
              {sliderControls.map((control) => (
                <div
                  key={control.id}
                  className="group relative rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {control.label}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {control.value}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step || 1}
                    value={control.value}
                    disabled={!isConnected}
                    onChange={(event) =>
                      handleSliderChange(control, event.target.value)
                    }
                    onMouseUp={() => handleSliderRelease(control)}
                    onTouchEnd={() => handleSliderRelease(control)}
                    onKeyUp={() => handleSliderRelease(control)}
                    className="w-full accent-cyan-600 disabled:opacity-50"
                  />
                  <div className="mt-1 flex justify-between font-mono text-xs text-slate-500 dark:text-slate-400">
                    <span>{control.min}</span>
                    <span className="truncate">
                      {(control.template || '{value}').replaceAll(
                        '{value}',
                        String(control.value),
                      )}
                    </span>
                    <span>{control.max}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeControl(control.id)}
                    aria-label={`Remove ${control.label}`}
                    className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 opacity-0 transition group-hover:opacity-100 hover:bg-rose-500 hover:text-white dark:bg-slate-800 dark:text-slate-200"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {recentSends.length > 0 && (
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recently Sent
            </h3>
            <ul className="space-y-1 rounded-lg bg-slate-50 p-2 font-mono text-xs dark:bg-slate-950">
              {recentSends.map((entry, index) => (
                <li
                  key={`${entry.time.getTime()}-${index}`}
                  className="flex items-center justify-between gap-3 truncate text-slate-700 dark:text-slate-200"
                >
                  <span className="truncate">{entry.payload}</span>
                  <span className="shrink-0 text-slate-400 dark:text-slate-500">
                    {entry.time.toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </aside>
  )
}

export default ControlPanel
