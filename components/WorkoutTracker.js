import { useState } from 'react';

export default function WorkoutTracker({ workouts, addWorkout }) {
  const [exercise, setExercise] = useState('');
  const [duration, setDuration] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (exercise && duration) {
      addWorkout({ exercise, duration: parseInt(duration) });
      setExercise('');
      setDuration('');
    }
  };

  return (
    <div className="workout-tracker">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          placeholder="Exercise"
          className="retro-input"
        />
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Duration (minutes)"
          className="retro-input"
        />
        <button type="submit" className="retro-button">Add Workout</button>
      </form>
      <ul className="workout-list">
        {workouts.map((workout, index) => (
          <li key={index} className="workout-item">
            {workout.exercise} - {workout.duration} minutes
          </li>
        ))}
      </ul>
    </div>
  );
}
