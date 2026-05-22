'use client';

import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

import { PRESET_TAGS } from '@/lib/constants';

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
}

export function TagsSelect({ value, onChange }: Props) {
  function toggle(tag: string) {
    onChange(value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag]);
  }

  const label = value.length === 0 ? 'Select tags...' : value.join(', ');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between font-normal">
          <span className="truncate">{label}</span>
          <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-1">
        {PRESET_TAGS.map((tag) => (
          <div
            key={tag}
            className="flex items-center gap-2 px-2 py-2 rounded hover:bg-muted cursor-pointer"
            onClick={() => toggle(tag)}
          >
            <Checkbox checked={value.includes(tag)} onCheckedChange={() => toggle(tag)} />
            <span className="capitalize text-sm">{tag}</span>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}
