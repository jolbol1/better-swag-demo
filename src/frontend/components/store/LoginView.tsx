import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, CheckCircle2, UserRound } from 'lucide-react';
import { useAuth } from '../../providers/Auth.provider';
import { trackBetterstackEvent } from '../../utils/betterstack';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export default function LoginView({ redirectTo = '/' }: { redirectTo?: string }) {
  const { demoUsers, isAuthenticated, signIn, signOut, user } = useAuth();
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    trackBetterstackEvent('login_page_viewed', {
      authenticated: isAuthenticated,
      redirectTo,
    });
  }, [isAuthenticated, redirectTo]);

  function handleSignIn(userId: string) {
    const selectedUser = signIn(userId);

    if (!selectedUser) {
      setFeedback('Unable to sign in with that demo user.');
      return;
    }

    setFeedback(`Signed in as ${selectedUser.username}.`);
    void router.push(redirectTo);
  }

  function handleSignOut() {
    signOut();
    setFeedback('Signed out.');
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_26%),linear-gradient(180deg,rgba(5,10,18,0.82),rgba(5,10,18,1))]" />
      <div className="relative mx-auto max-w-6xl px-5 py-6 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[32px] border border-white/10 bg-black/20 px-5 py-4 backdrop-blur">
          <Button asChild variant="ghost" className="-ml-2 rounded-2xl text-muted-foreground">
            <Link href={redirectTo}>
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-muted-foreground">
            Demo auth only. Identity lives in browser storage and updates Better Stack user
            tracking.
          </div>
        </div>

        <main className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-primary">Demo login</p>
              <h1 className="text-4xl font-semibold tracking-tight">
                Sign in as a fake customer to generate identified frontend activity.
              </h1>
              <p className="max-w-3xl text-base leading-8 text-muted-foreground">
                Once selected, the app calls <code>betterstack(&apos;user&apos;, ...)</code>,
                swaps the demo session to that user, and keeps cart, checkout, and recommendation
                traffic aligned with the identified user.
              </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              {demoUsers.map(demoUser => (
                <Card key={demoUser.id}>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div
                        className="flex size-14 items-center justify-center rounded-full text-lg font-semibold text-slate-950"
                        style={{ backgroundColor: demoUser.avatarAccent }}
                      >
                        {demoUser.firstName[0]}
                        {demoUser.lastName[0]}
                      </div>
                      <div>
                        <CardTitle>{demoUser.username}</CardTitle>
                        <CardDescription>{demoUser.role}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em]">Company</p>
                        <p className="mt-1 text-foreground">{demoUser.company}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em]">Plan</p>
                        <p className="mt-1 text-foreground">{demoUser.plan}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em]">Team</p>
                        <p className="mt-1 text-foreground">{demoUser.team}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em]">Location</p>
                        <p className="mt-1 text-foreground">
                          {demoUser.city}, {demoUser.state}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-muted-foreground">
                      Prefers {demoUser.preferredCategory.toLowerCase()} gear and works well for
                      identified-user demos in errors, events, and replay.
                    </div>

                    <Button
                      type="button"
                      className="w-full rounded-2xl"
                      id={`login-${demoUser.id}`}
                      onClick={() => handleSignIn(demoUser.id)}
                    >
                      <UserRound className="size-4" />
                      Sign in as {demoUser.firstName}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current session</CardTitle>
                <CardDescription>
                  Use this to switch users or clear identification before recording.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user ? (
                  <div className="rounded-3xl border border-emerald-400/15 bg-emerald-400/10 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="size-5 text-emerald-300" />
                      <div>
                        <p className="font-medium text-foreground">{user.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.email} • {user.plan}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-4 text-sm text-muted-foreground">
                    No identified user yet. Anonymous traffic still works, but Better Stack will not
                    associate it with a named customer until you sign in.
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-2xl"
                  id="logout-current-user"
                  onClick={handleSignOut}
                  disabled={!user}
                >
                  Clear identified user
                </Button>

                {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}
              </CardContent>
            </Card>
          </aside>
        </main>
      </div>
    </div>
  );
}
