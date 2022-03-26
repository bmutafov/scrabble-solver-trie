import axios from "axios";

async function startsWith(word: string, depth?: number): Promise<string[]> {
  const response = await axios.get<{ res: string[] }>(
    encodeURI("http://localhost:5100/starts?str=" + word + "&l=" + depth)
  );
  const { data } = response;
  return data.res;
}

async function endsWith(word: string, depth?: number): Promise<string[]> {
  const response = await axios.get<{ res: string[] }>(
    encodeURI("http://localhost:5100/ends?str=" + word + "&l=" + depth)
  );
  const { data } = response;
  return data.res;
}

async function finishWith(word: string, hand: string[]): Promise<string[]> {
  const response = await axios.get<{ res: string[] }>(
    encodeURI(
      "http://localhost:5100/finish?str=" + word + "&hand=" + hand.join("")
    )
  );
  const { data } = response;
  return data.res;
}

async function between(prefix: string, suffix: string): Promise<string[]> {
  const response = await axios.get<{ res: string[] }>(
    encodeURI("http://localhost:5100/between?p=" + prefix + "&s=" + suffix)
  );
  const { data } = response;
  return data.res;
}

async function byPattern(
  word: string,
  b: string[],
  a: string[],
  h: string[]
): Promise<string[]> {
  try {
    const response = await axios.post<{ res: string[] }>(
      encodeURI("http://localhost:5100/pattern"),
      {
        s: word,
        b,
        a,
        h,
      }
    );
    const { data } = response;
    return data.res;
  } catch (e) {
    console.error("ERROR: with patthern " + word);
    throw new Error();
  }
}

export default {
  startsWith,
  endsWith,
  finishWith,
  byPattern,
  between,
};
