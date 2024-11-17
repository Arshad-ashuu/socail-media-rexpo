
import { Stack } from 'expo-router'

const AuthLayout = () => {
  return (
<Stack>
    <Stack.Screen name="Signup" options={{ headerShown: false }} />
    <Stack.Screen name="Signin" options={{ headerShown: false }} />
</Stack>
  )
}

export default AuthLayout