'use client';
import { Volume2 } from 'lucide-react';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
export function Pick({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(v) => {
        if (v !== null) onChange(String(v));
      }}
      items={options}
    >
      <SelectTrigger className="picker" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
export function Speak({
  text,
  lang = 'en-US',
}: {
  text: string;
  lang?: string;
}) {
  const [error, setError] = useState('');
  function speak() {
    if (window.wordnestDesktop) {
      setError('');
      void window.wordnestDesktop
        .speak(text)
        .then((result) => {
          if (!result.ok)
            setError(
              result.error === 'invalid-text'
                ? 'Chỉ đọc tối đa 500 ký tự mỗi lần.'
                : 'Chưa phát được âm thanh. Kiểm tra loa và giọng tiếng Anh của Windows.',
            );
        })
        .catch(() => setError('Không kết nối được chức năng phát âm Windows.'));
      return;
    }
    if (!('speechSynthesis' in window)) {
      setError('Trình duyệt chưa hỗ trợ đọc phát âm.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    const voice =
      window.speechSynthesis.getVoices().find((v) => v.lang === lang) ??
      window.speechSynthesis
        .getVoices()
        .find((v) => v.lang.startsWith(lang.slice(0, 2)));
    if (voice) utterance.voice = voice;
    utterance.onerror = (e) => {
      if (!['interrupted', 'canceled'].includes(e.error))
        setError('Chưa phát được âm thanh. Kiểm tra giọng đọc trên thiết bị.');
    };
    setError('');
    window.speechSynthesis.speak(utterance);
  }
  return (
    <span className="speak-wrap">
      <button
        className="icon-button"
        title="Nghe phát âm"
        aria-label={'Nghe phát âm: ' + text}
        onClick={speak}
      >
        <Volume2 size={20} />
      </button>
      {error && <output className="speech-error">{error}</output>}
    </span>
  );
}
