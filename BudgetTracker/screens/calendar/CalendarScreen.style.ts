import { StyleSheet } from 'react-native';

export const CalendarScreenStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarBox: {
    width: '100%',
  },
  calendarText: {
    color: '#fff',
  },
  selectedDay: {
    backgroundColor: '#fff',
    opacity: 0.5,
  },
  selectedDayText: {
    color: '#000',
    opacity: 1,
  },
});
