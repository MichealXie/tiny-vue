import { mountApp } from "../vue/api"
import { app } from "./pages/Home"

mountApp(app, document.getElementById('app')!)
