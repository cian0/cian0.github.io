import { useState, useEffect } from 'react';

export default function WorkoutTracker({ workouts, addWorkout }) {
  const [exercise, setExercise] = useState('');
  const [duration, setDuration] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (exercise && duration) {
      const newWorkout = { exercise, duration: parseInt(duration), date: new Date().toISOString() };
      addWorkout(newWorkout);
      setExercise('');
      setDuration('');
    }
  };

  const handleClearWorkouts = () => {
    localStorage.removeItem('workouts');
    window.location.reload();
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
            {workout.date && ` (${new Date(workout.date).toLocaleDateString()})`}
          </li>
        ))}
      </ul>
      {workouts.length > 0 && (
        <button onClick={handleClearWorkouts} className="retro-button clear-button">
          Clear All Workouts
        </button>
      )}
    </div>
  );
}
