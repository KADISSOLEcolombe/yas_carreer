'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Interview } from '../lib/interviews';
import {
  WEEKDAYS,
  getCalendarDays,
  getInterviewsForDate,
  formatMonthYear,
  isSameDay,
  INTERVIEW_STATUS_STYLES,
} from '../lib/interviewCalendar';
import { COLORS } from '../lib/constants';

interface InterviewCalendarProps {
  interviews: Interview[];
  currentMonth: Date;
  selectedDate: Date | null;
  onMonthChange: (date: Date) => void;
  onSelectDate: (date: Date) => void;
  onSelectInterview: (interview: Interview) => void;
}

export default function InterviewCalendar({
  interviews,
  currentMonth,
  selectedDate,
  onMonthChange,
  onSelectDate,
  onSelectInterview,
}: InterviewCalendarProps) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const days = getCalendarDays(year, month);
  const today = new Date();

  const goToPrevMonth = () => {
    onMonthChange(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    onMonthChange(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const now = new Date();
    onMonthChange(new Date(now.getFullYear(), now.getMonth(), 1));
    onSelectDate(now);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold capitalize" style={{ color: COLORS.midnight }}>
          {formatMonthYear(currentMonth)}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToToday}
            className="text-xs px-3 py-1.5 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
          >
            Aujourd'hui
          </button>
          <button
            type="button"
            onClick={goToPrevMonth}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
            aria-label="Mois précédent"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
            aria-label="Mois suivant"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-semibold text-gray-500 uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="min-h-[110px] border-b border-r border-gray-100 bg-gray-50/50" />;
          }

          const dayInterviews = getInterviewsForDate(interviews, date);
          const isToday = isSameDay(date, today);
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
          const scheduledCount = dayInterviews.filter((i) => i.status === 'SCHEDULED').length;

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`min-h-[110px] p-2 sm:p-3 border-b border-r border-gray-100 text-left transition-colors hover:bg-yellow-50/50 ${
                isSelected ? 'bg-yellow-50 ring-2 ring-inset ring-yellow-400' : ''
              }`}
            >
              <span
                className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium mb-1 ${
                  isToday ? 'text-gray-900' : 'text-gray-700'
                }`}
                style={isToday ? { backgroundColor: COLORS.yellow } : undefined}
              >
                {date.getDate()}
              </span>

              {dayInterviews.length > 0 && (
                <div className="space-y-0.5">
                  {dayInterviews.slice(0, 3).map((interview) => {
                    const style = INTERVIEW_STATUS_STYLES[interview.status];
                    return (
                      <div
                        key={interview.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectInterview(interview);
                        }}
                        className="hidden sm:block text-[10px] leading-tight px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
                        style={{ backgroundColor: style.bg, color: style.text }}
                        title={`${interview.candidateName} — ${new Date(interview.dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`}
                      >
                        {new Date(interview.dateTime).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        {interview.candidateName.split(' ')[0]}
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-0.5 sm:hidden">
                    {dayInterviews.slice(0, 3).map((interview) => (
                      <span
                        key={interview.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: INTERVIEW_STATUS_STYLES[interview.status].dot }}
                      />
                    ))}
                  </div>
                  {dayInterviews.length > 3 && (
                    <p className="text-[10px] text-gray-500 hidden sm:block">+{dayInterviews.length - 3}</p>
                  )}
                  {scheduledCount > 0 && (
                    <p className="text-[10px] font-medium sm:hidden" style={{ color: COLORS.midnight }}>
                      {dayInterviews.length} entretien{dayInterviews.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="px-4 py-3 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-600">
        {(['SCHEDULED', 'COMPLETED', 'CANCELLED'] as const).map((status) => (
          <span key={status} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: INTERVIEW_STATUS_STYLES[status].dot }}
            />
            {INTERVIEW_STATUS_STYLES[status].label}
          </span>
        ))}
      </div>
    </div>
  );
}
