import { useState, useEffect } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore";

const db = getFirestore();

const Login = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (role === "admin") {
      fetchUsers();
    }
  }, [role]);

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsers(usersList);
  };

  const toggleActiveStatus = async (userId, currentStatus) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { activo: !currentStatus });
    fetchUsers();
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userData = result.user;

      const userRef = doc(db, "users", userData.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userInfo = userDoc.data();
        if (!userInfo.activo) {
          setError("Tu cuenta está desactivada. Contacta al administrador.");
          await signOut(auth);
          return;
        }
        setUser(userData);
        setRole(userInfo.role);
      } else {
        await setDoc(userRef, { role: "user", email: userData.email, activo: true });
        setUser(userData);
        setRole("user");
      }
    } catch (error) {
      console.error("Error en el login", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setRole(null);
      setUsers([]);
      setError(null);
    } catch (error) {
      console.error("Error en el logout", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {error && <p className="text-red-500">{error}</p>}
      {user ? (
        role === "admin" ? (
          <div className="text-center">
            <h2 className="text-xl font-bold">Panel de Administración</h2>
            <button 
              onClick={handleLogout} 
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              Cerrar sesión
            </button>
            <div className="mt-4">
              <h3 className="text-lg font-bold">Usuarios Registrados</h3>
              <ul>
                {users.map((usr) => (
                  <li key={usr.id} className="flex justify-between items-center p-2 border-b">
                    {usr.email} - {usr.role} - {usr.activo ? "Activo" : "Inactivo"}
                    <button 
                      onClick={() => toggleActiveStatus(usr.id, usr.activo)}
                      className="ml-4 px-2 py-1 bg-blue-500 text-white rounded"
                    >
                      {usr.activo ? "Desactivar" : "Activar"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-bold">Hola, {user.displayName}!</h2>
            <p className="text-sm font-semibold text-gray-500">Rol: {role}</p>
            <button 
              onClick={handleLogout} 
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              Cerrar sesión
            </button>
          </div>
        )
      ) : (
        <button 
          onClick={handleLogin} 
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Iniciar sesión con Google
        </button>
      )}
    </div>
  );
};

export default Login;
