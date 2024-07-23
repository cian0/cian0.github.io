# Music Player Composition Format Documentation

## Overview

The composition format is a text-based representation of a musical piece, designed to be parsed and played by the custom music player. It consists of a header line followed by multiple track definitions.

## Composition Structure

```
<Tempo>;<Time Signature>
T:<Track Name>;<Instrument>;<Effect1>;<Effect2>;<Volume>
N:<Note1>;<Note2>;<Note3>...
T:<Track Name>;<Instrument>;<Effect1>;<Effect2>;<Volume>
N:<Note1>;<Note2>;<Note3>...
```

## Header

The first line of the composition defines global settings:

```
<Tempo>;<Time Signature>
```

- `<Tempo>`: Integer value representing beats per minute (BPM)
- `<Time Signature>`: Expressed as `numerator/denominator`, e.g., `4/4`

Example: `140;4/4`

## Track Definition

Each track starts with a `T:` line defining its properties, followed by an `N:` line listing its notes.

### Track Properties (T: line)

```
T:<Track Name>;<Instrument>;<Effect1>;<Effect2>;<Volume>
```

- `<Track Name>`: A descriptive name for the track
- `<Instrument>`: Instrument type and its parameters
- `<Effect1>`, `<Effect2>`, etc.: Optional effects applied to the track
- `<Volume>`: Volume adjustment in decibels (dB)

#### Instrument Format

```
<InstrumentType>{<param1>:<value1>;<param2>:<value2>}
```

Example: `Synth{type:sawtooth;envelope:0.1,0.2,0.5,1}`

#### Effect Format

```
<EffectType>{<param1>,<param2>,<param3>}
```

Example: `PingPongDelay{16n,0.4,0.2}`

### Notes (N: line)

```
N:<Pitch>,<Duration>,<StartTime>;<Pitch>,<Duration>,<StartTime>;...
```

- `<Pitch>`: Note pitch in scientific notation (e.g., C4, F#5)
- `<Duration>`: Note duration (e.g., 4n for quarter note, 8n for eighth note)
- `<StartTime>`: Start time of the note in bars:beats format (e.g., 0:0, 1:2)

For chords, separate pitches with spaces: `C4 E4 G4`

## Example Composition

```
140;4/4
T:Lead Synth;Synth{type:sawtooth;envelope:0.1,0.2,0.5,1};PingPongDelay{16n,0.4,0.2};Reverb{0.5,3};-8
N:C4,8n,0:0;E4,8n,0:0.5;G4,8n,0:1;B4,8n,0:1.5;C5,4n,0:2
T:Bass;FMSynth{harmonicity:3;modulationIndex:10};AutoFilter{4,5,0.2};-10
N:C2,2n,0:0;G2,2n,0:2
```

This example defines a composition with a tempo of 140 BPM in 4/4 time, containing two tracks: a lead synth and a bass part.

## Notes on Specific Elements

1. **Instruments**: The player supports various Tone.js instruments like `Synth`, `FMSynth`, `AMSynth`, `PluckSynth`, etc. Each instrument type has its own set of parameters.

2. **Effects**: Supported effects include `PingPongDelay`, `Reverb`, `Chorus`, `Distortion`, `AutoFilter`, etc. Refer to Tone.js documentation for specific effect parameters.

3. **Envelopes**: When specifying envelopes, use the format `env:attack,decay,sustain,release`.

4. **Modulation**: For instruments supporting modulation, use the format `mod:type,options`.

5. **Note Durations**: Use `n` suffix for note durations (e.g., `4n` for quarter note, `8n` for eighth note, `16n` for sixteenth note).

6. **Time Signatures**: The player supports various time signatures like 4/4, 3/4, 6/8, etc.

## Extending a Composition

To add new sections to an existing composition, follow these steps:

1. **Determine the ending measure**: Identify the last measure of your existing composition. This will be your starting point for the new section.

2. **Create new track lines**: For each track in your new section, create new `T:` lines following the same format as the original composition. You can either:
   - Continue existing tracks by using the same track names and instruments.
   - Introduce new tracks with different instruments or effects.

3. **Add note lines**: For each track, add new `N:` lines with notes for the additional measures. Make sure to:
   - Start the measure numbers where the original composition ended.
   - Maintain the same time signature and tempo unless you intend to change them.

4. **Adjust global settings** (if necessary):
   - If you're changing the tempo or time signature for the new section, add a new header line with the updated values.

5. **Ensure continuity**: Make sure the new section flows smoothly from the existing composition by considering:
   - Harmonic progression
   - Rhythmic patterns
   - Melodic themes

6. **Update total duration**: If you're using the custom player, you may need to adjust the total duration to account for the additional measures.

### Example

Original composition (2 measures):

```
140;4/4
T:Lead;Synth{type:sawtooth};-5
N:C4,4n,0:0;E4,4n,0:1;G4,4n,0:2;C5,4n,0:3;B4,4n,1:0;G4,4n,1:1;E4,4n,1:2;C4,4n,1:3
T:Bass;FMSynth{harmonicity:3};-10
N:C2,2n,0:0;G2,2n,0:2;C2,2n,1:0;G2,2n,1:2
```

Extended composition (4 measures):

```
140;4/4
T:Lead;Synth{type:sawtooth};-5
N:C4,4n,0:0;E4,4n,0:1;G4,4n,0:2;C5,4n,0:3;B4,4n,1:0;G4,4n,1:1;E4,4n,1:2;C4,4n,1:3
T:Bass;FMSynth{harmonicity:3};-10
N:C2,2n,0:0;G2,2n,0:2;C2,2n,1:0;G2,2n,1:2

T:Lead;Synth{type:sawtooth};-5
N:F4,4n,2:0;A4,4n,2:1;C5,4n,2:2;F5,4n,2:3;E5,4n,3:0;C5,4n,3:1;A4,4n,3:2;F4,4n,3:3
T:Bass;FMSynth{harmonicity:3};-10
N:F2,2n,2:0;C3,2n,2:2;F2,2n,3:0;C3,2n,3:2
```

In this example, we've added two more measures to the original two-measure composition, continuing the existing tracks and patterns while introducing variation in the melody and harmony.

Remember to maintain consistency in your track names, instruments, and overall style when extending your composition, unless your goal is to introduce a significant change or contrast in the music.