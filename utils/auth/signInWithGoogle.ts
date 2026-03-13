import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { supabase } from 'data/supabase'

export const signInWithGoogle = async () => {
    const redirectUrl = AuthSession.makeRedirectUri({ scheme: 'aiassistant', path: 'auth' })

    const {data, error} = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: redirectUrl,
            skipBrowserRedirect: true
        }
    })

    console.log('redirectUrl:', redirectUrl)

    if (error) {
        console.error(error)
        return
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl)

    if (result.type === 'success') {
        const url = result.url;
        const {error} = await supabase.auth.exchangeCodeForSession(url)
 
        if (error) console.log(error)
    }

}
