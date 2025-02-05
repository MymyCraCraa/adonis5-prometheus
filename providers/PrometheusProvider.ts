import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import * as prometheus from 'prom-client'

export default class PrometheusProvider {
  public static needsApplication = true
  constructor(protected app: ApplicationContract) {}

  public register(): void {
    const Config = this.app.container.resolveBinding('Adonis/Core/Config')

    const systemMetrics = Config.get('prometheus.systemMetrics')
    if (Config.get('prometheus.systemMetrics').enabled) {
      const { enabled, ...params } = systemMetrics
      prometheus.collectDefaultMetrics(params)
    }

    if (Config.get('prometheus.exposeHttpEndpoint')) {
      this.exposeMetrics(Config.get('prometheus.endpoint'))
    }

    this.app.container.singleton('Adonis/Prometheus', () => prometheus)
  }

  private exposeMetrics(urlPath: string = '/metrics') {
    const router = this.app.container.resolveBinding('Adonis/Core/Route')

    router.get(urlPath, async ({ response }) => {
      response
        .header('Content-type', prometheus.register.contentType)
        .ok(await prometheus.register.metrics())
    })
  }

  public async boot() {
    // All bindings are ready, feel free to use them
  }

  public async ready() {
    // App is ready
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
