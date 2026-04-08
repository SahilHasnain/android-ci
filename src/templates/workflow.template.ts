interface WorkflowTemplateOptions {
  androidProjectPath: string;
  appVariant: "development" | "preview" | "production";
  runnerLabel: string;
  androidApplicationId: string;
  keystorePath: string;
  enablePlayDeploy: boolean;
  enableSentry: boolean;
}

export function workflowTemplate(options: WorkflowTemplateOptions): string {
  const playJsonPath = "/home/Sahilhasnain/android-secrets/play-store-key.json";
  const sentryStep = options.enableSentry
    ? `      - name: Configure optional Sentry
        if: \${{ vars.SENTRY_ORG != '' && vars.SENTRY_PROJECT != '' }}
        run: |
          cat > ${options.androidProjectPath}/sentry.properties <<EOF
          defaults.url=https://sentry.io/
          defaults.org=\${{ vars.SENTRY_ORG }}
          defaults.project=\${{ vars.SENTRY_PROJECT }}
          EOF

`
    : "";

  const deployStep = options.enablePlayDeploy
    ? `      - name: Fastlane deploy
        if: \${{ env.APP_VARIANT == 'production' }}
        env:
          SENTRY_AUTH_TOKEN: \${{ secrets.SENTRY_AUTH_TOKEN }}
          SUPPLY_JSON_KEY: \${{ vars.PLAY_STORE_JSON_KEY_PATH || '${playJsonPath}' }}
          ANDROID_APPLICATION_ID: \${{ vars.ANDROID_APPLICATION_ID || '${options.androidApplicationId}' }}
          PLAY_TRACK: \${{ vars.PLAY_TRACK || 'alpha' }}
          SKIP_ANDROID_BUILD: "true"
          ANDROID_KEYSTORE_PATH: \${{ vars.ANDROID_KEYSTORE_PATH || '${options.keystorePath}' }}
          ANDROID_KEYSTORE_PASSWORD: \${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          ANDROID_KEY_ALIAS: \${{ secrets.ANDROID_KEY_ALIAS }}
          ANDROID_KEY_PASSWORD: \${{ secrets.ANDROID_KEY_PASSWORD }}
        run: |
          cd ${options.androidProjectPath}
          bundle install
          fastlane android deploy
`
    : "";

  const cleanupStep = `      - name: Cleanup build artifacts
        if: always()
        run: |
          cd ${options.androidProjectPath}
          ./gradlew clean
          rm -rf ~/.gradle/caches/build-cache-*
`;

  return `name: Android Self Hosted

on:
  workflow_dispatch:
    inputs:
      app_variant:
        description: App variant to build
        required: false
        default: ${options.appVariant}
        type: choice
        options:
          - development
          - preview
          - production

jobs:
  build-android:
    runs-on: [self-hosted, linux, x64, ${options.runnerLabel}]
    defaults:
      run:
        shell: bash
    env:
      ANDROID_SDK_ROOT: /opt/android-sdk
      JAVA_HOME: /usr/lib/jvm/java-17-openjdk-amd64
      APP_VARIANT: \${{ inputs.app_variant || '${options.appVariant}' }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: "3.2"
          bundler-cache: false

      - name: Install dependencies
        run: |
          npm ci

      - name: Configure Android SDK path
        run: |
          printf "sdk.dir=%s\\n" "$ANDROID_SDK_ROOT" > ${options.androidProjectPath}/local.properties

${sentryStep}      - name: Build Android artifact
        env:
${options.enableSentry ? "          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}\n" : ""}          ANDROID_KEYSTORE_PATH: \${{ vars.ANDROID_KEYSTORE_PATH || '${options.keystorePath}' }}
          ANDROID_KEYSTORE_PASSWORD: \${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          ANDROID_KEY_ALIAS: \${{ secrets.ANDROID_KEY_ALIAS }}
          ANDROID_KEY_PASSWORD: \${{ secrets.ANDROID_KEY_PASSWORD }}
        run: |
          cd ${options.androidProjectPath}
          chmod +x ./gradlew
          if [ "$APP_VARIANT" = "preview" ]; then
            ./gradlew assembleRelease
          else
            ./gradlew bundleRelease
          fi

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: android-\${{ env.APP_VARIANT }}-artifact
          path: |
            ${options.androidProjectPath}/app/build/outputs/**/*.aab
            ${options.androidProjectPath}/app/build/outputs/**/*.apk
${deployStep}${cleanupStep}
`;
}
