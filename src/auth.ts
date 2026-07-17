import NextAuth from 'next-auth'
import Slack from 'next-auth/providers/slack'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Slack],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  callbacks: {
    async signIn({ profile }) {
      const expectedTeamId = process.env.SLACK_TEAM_ID
      if (!expectedTeamId) return true
      const teamId = (profile as Record<string, unknown> | undefined)?.[
        'https://slack.com/team_id'
      ]
      return teamId === expectedTeamId
    },
  },
  pages: {
    signIn: '/signin',
  },
})
