import { Observable, of } from "rxjs";

export function greeter(person: string): Observable<string> {
  return of("Hello, " + person);
}
