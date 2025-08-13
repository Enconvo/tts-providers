
const straicoVoices =
  [
    { value: "alloy", title: "Alloy" },
    { value: "echo", title: "Echo" },
    { value: "fable", title: "Fable" },
    { value: "onyx", title: "Onyx" },
    { value: "nova", title: "Nova" },
    { value: "shimmer", title: "Shimmer" },
  ]

export default async function main(): Promise<string> {

  const voices = straicoVoices;

  return JSON.stringify(voices);
}
