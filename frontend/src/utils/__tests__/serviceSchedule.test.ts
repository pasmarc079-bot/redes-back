import { describe, it, expect } from 'vitest';
import { fromTimeInputValue, toTimeInputValue, WEEKDAYS } from '@/utils/serviceSchedule';

describe('toTimeInputValue', () => {
  it('convierte las horas guardadas al formato del selector', () => {
    expect(toTimeInputValue('9:00 AM')).toBe('09:00');
    expect(toTimeInputValue('7:00 PM')).toBe('19:00');
    expect(toTimeInputValue('12:00 AM')).toBe('00:00');
    expect(toTimeInputValue('12:30 PM')).toBe('12:30');
    expect(toTimeInputValue('19:30')).toBe('19:30');
    expect(toTimeInputValue('7 pm')).toBe('19:00');
  });

  it('deja vacío lo que no es una hora, sin romper el formulario', () => {
    expect(toTimeInputValue('')).toBe('');
    expect(toTimeInputValue(null)).toBe('');
    expect(toTimeInputValue('por confirmar')).toBe('');
    expect(toTimeInputValue('25:00')).toBe('');
  });
});

describe('fromTimeInputValue', () => {
  it('devuelve la etiqueta que ve el visitante', () => {
    expect(fromTimeInputValue('09:00')).toBe('9:00 AM');
    expect(fromTimeInputValue('19:00')).toBe('7:00 PM');
    expect(fromTimeInputValue('00:00')).toBe('12:00 AM');
    expect(fromTimeInputValue('12:15')).toBe('12:15 PM');
  });

  it('ignora valores incompletos', () => {
    expect(fromTimeInputValue('')).toBe('');
    expect(fromTimeInputValue('9')).toBe('');
  });
});

describe('WEEKDAYS', () => {
  it('son los siete días, empezando por domingo', () => {
    expect(WEEKDAYS).toHaveLength(7);
    expect(WEEKDAYS[0]).toBe('Domingo');
    expect(WEEKDAYS[6]).toBe('Sábado');
  });
});
