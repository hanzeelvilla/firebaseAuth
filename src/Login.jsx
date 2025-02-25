import { useState, useEffect } from "react";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { auth } from "./firebaseConfig";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";

const db = getFirestore();
const Login = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (role === "admin") {
      fetchUsers();
    }
  }, [role]);

  const fetchUsers = async () => {
    if (role === "admin") {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } else {
      setUsers([]);
    }
  };

  const handleTraditionalAuth = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      
      const userData = userCredential.user;
      const userRef = doc(db, "users", userData.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, { 
          role: "user", 
          email: userData.email, 
          activo: true,
          displayName: userData.email.split('@')[0] 
        });
      }

      // Check if the user is inactive
    if (userDoc.exists() && userDoc.data().activo === false) {
      setError("Tu cuenta está desactivada. Por favor, contacta al administrador.");
      await signOut(auth); // Sign out the user if they are inactive
      return; // Stop further execution
    }

      setUser(userData);
      setRole(userDoc.data()?.role || "user");
      fetchUsers();
      
    } catch (error) {
      console.error("Authentication error:", error);
      setError(getAuthErrorMessage(error.code));
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userData = result.user;
      const userRef = doc(db, "users", userData.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          role: "user",
          email: userData.email,
          activo: true,
          displayName: userData.displayName || userData.email.split('@')[0]
        });
      }
      
          // Check if the user is inactive
    if (userDoc.exists() && userDoc.data().activo === false) {
      setError("Tu cuenta está desactivada. Por favor, contacta al administrador.");
      await signOut(auth); // Sign out the user if they are inactive
      return; // Stop further execution
    }


      setUser(userData);
      setRole(userDoc.data()?.role || "user");
      fetchUsers();
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      setError(getAuthErrorMessage(error.code));
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { activo: !currentStatus });
    fetchUsers();
  };

  const getAuthErrorMessage = (code) => {
    switch(code) {
      case 'auth/invalid-email': return 'Email inválido';
      case 'auth/user-disabled': return 'Cuenta desactivada';
      case 'auth/user-not-found': return 'Usuario no registrado';
      case 'auth/wrong-password': return 'Contraseña incorrecta';
      case 'auth/email-already-in-use': return 'Email ya registrado';
      case 'auth/weak-password': return 'Contraseña débil (mínimo 6 caracteres)';
      default: return 'Error de autenticación';
    }
  };

  return (
<section className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-50 to-purple-50 p-4 login-container" >
  <div className="w-full max-w-lg bg-white rounded-lg shadow-xl p-8 mx-auto">
        {error && <p className="text-red-500 p-2 bg-red-100 rounded-lg text-center">{error}</p>}
        
        {user ? (
          <div className="text-center">
            <p className="text-lg font-bold">Bienvenido, {user.displayName || user.email}</p>
            <p className="text-gray-600">Rol: {role}</p>
            <button 
              onClick={handleLogout} 
              className="mt-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300"
            >
              Cerrar sesión
            </button>

            {role === "admin" && (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Lista de Usuarios</h2>
                <table className="w-full bg-white rounded-lg overflow-hidden shadow-md">
                  <thead className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    <tr>
                      <th className="p-3 text-left">Nombre</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">Rol</th>
                      <th className="p-3 text-left">Estado</th>
                      <th className="p-3 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-200">
                        <td className="p-3">{user.displayName}</td>
                        <td className="p-3">{user.email}</td>
                        <td className="p-3">{user.role}</td>
                        <td className="p-3">{user.activo ? "Activo" : "Inactivo"}</td>
                        <td className="p-3">
                          <button
                            onClick={() => toggleUserStatus(user.id, user.activo)}
                            className={`p-2 rounded-full ${
                              user.activo ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                            } text-white transition duration-300`}
                          >
                            {user.activo ? "Desactivar" : "Activar"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-4"> {isLogin ? 'Iniciar sesión' : 'Registrarse'} </h2>
            <form onSubmit={handleTraditionalAuth} className="space-y-4 element-spacing">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button 
                type="submit" 
                className="w-full p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300"
              >
                {isLogin ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            </form>

            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="w-full text-blue-500 hover:text-blue-700 text-sm mt-2 element-spacing"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500"> </span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="google-button"
            >
              <img
                src="https://accounts.scdn.co/sso/images/new-google-icon.72fd940a229bc94cf9484a3320b3dccb.svg"
                alt="Google Logo"
                className="google-icon"
              />
  
              <span >Continuar con Google</span>
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default Login;