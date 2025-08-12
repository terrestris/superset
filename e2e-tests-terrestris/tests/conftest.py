import pytest
import os
from playwright.sync_api import sync_playwright, expect


URL = os.environ.get('TEST_URL', 'http://localhost:8088/')
USERNAME = os.environ.get('TEST_USERNAME', 'admin')
PASSWORD = os.environ.get('TEST_PASSWORD', 'admin')
WFS = os.environ.get(
    'TEST_WFS',
    'wfs://geodienste.leipzig.de/l3/OpenData/wfs'
    '?REQUEST=GetCapabilities&SERVICE=WFS'
)


@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        yield browser
        browser.close()


@pytest.fixture
def page(browser):
    context = browser.new_context()
    page = context.new_page()
    yield page
    context.close()


@pytest.fixture(autouse=True, scope="function")
def admin_login(page):
    page.goto(URL)
    expect(page).to_have_title('Superset')

    page.locator('#username').fill(USERNAME)
    page.locator('#password').fill(PASSWORD)
    page.locator('input.btn.btn-primary.btn-block').click()
    page.wait_for_load_state('networkidle')

    assert 'welcome' in page.url, f'Expected "welcome" in URL, got {page.url}'


def create_wfs_connection(page):
    page.goto(URL + 'databaseview/list/')
    page.wait_for_load_state('networkidle')

    expect(page.locator('i.fa-plus')).to_be_visible()
    page.locator('i.fa-plus').click()
    page.wait_for_load_state('networkidle')
    expect(page.locator('h4:has-text("Connect a database")')).to_be_visible()

    # Fill in the WFS connection form and create the database
    expect(page.locator('#rc_select_4')).to_be_visible()
    page.locator('#rc_select_4').click()
    page.locator('div[title="Other"]').click()
    page.wait_for_load_state('networkidle')
    expect(page.locator('[name="sqlalchemy_uri"]')).to_be_visible()
    page.locator('[name="sqlalchemy_uri"]').fill(WFS)
    page.get_by_text('Test connection').click()
    expect(page.get_by_text('Connection looks good!')).to_be_visible()
    page.wait_for_load_state('networkidle')
    connect_button = page.locator('button.superset-button-primary').nth(1)
    try:
        expect(connect_button).to_be_visible(timeout=2000)
        connect_button.click()
    except Exception:
        connect_button.scroll_into_view_if_needed()
        expect(connect_button).to_be_visible()
        connect_button.click()
    try:
        expect(page.get_by_text('Database connected')).to_be_visible()
    except Exception:
        expect(page.get_by_text('already exists')).to_be_visible()
    page.wait_for_load_state('networkidle')

    row = page.locator('table[role="table"] tbody tr', has_text="Other").first
    backend_cell = row.locator('td').nth(1)
    assert "wfs" in backend_cell.inner_text()


def delete_wfs_connection(page):
    page.goto(URL + 'databaseview/list/')
    page.wait_for_load_state('networkidle')

    # Delete the database
    page.locator('span[aria-label="trash"]').first.click()
    page.wait_for_load_state('networkidle')
    expect(page.get_by_text('Delete Database?')).to_be_visible()
    page.locator('#delete').fill('DELETE')
    page.locator('button:has-text("Delete")').click()
    page.wait_for_load_state('networkidle')

    expect(page.get_by_text('Deleted:')).to_be_visible()
    expect(page.locator('span:has-text("Other")')).to_have_count(0)


def create_dataset(page):
    create_wfs_connection(page)

    page.goto(URL + 'tablemodelview/list/')
    page.wait_for_load_state('networkidle')

    expect(page.locator('i.fa-plus')).to_be_visible()
    page.locator('i.fa-plus').click()
    page.wait_for_load_state('networkidle')
    expect(page.get_by_text('New dataset')).to_be_visible()

    expect(
        page.locator(
            'input[aria-label="Select database or type to search '
            'databases"]'
        )
    ).to_be_visible()
    page.locator(
        'input[aria-label="Select database or type to search '
        'databases"]'
    ).click()
    page.locator('div[backend="wfs"]').first.click()
    page.wait_for_load_state('networkidle')

    expect(
        page.locator(
            'input[aria-label="Select table or type to search tables"]'
        )
    ).to_be_visible()
    page.locator(
        'input[aria-label="Select table or type to search tables"]'
    ).click()
    page.locator('span[aria-label="table"]').first.click()
    page.wait_for_load_state('networkidle')
    try:
        page.get_by_text('Create dataset and create chart').click()
        page.wait_for_load_state('networkidle')
        try:
            expect(
                page.get_by_text('Create a new chart')
            ).to_be_visible(
                timeout=2000
            )
        except Exception:
            expect(
                page.get_by_text('already exists')
            ).to_be_visible(timeout=2000)
    except Exception:
        expect(
            page.get_by_text('This table already has a dataset').first
        ).to_be_visible(
             timeout=2000
        )


def delete_dataset(page):
    page.goto(URL + 'tablemodelview/list/')
    page.wait_for_load_state('networkidle')

    # Delete the database
    page.locator('span[aria-label="trash"]').first.click()
    page.wait_for_load_state('networkidle')
    expect(page.get_by_text('Delete Dataset?')).to_be_visible()
    page.locator('#delete').fill('DELETE')
    page.locator('button:has-text("Delete")').click()
    page.wait_for_load_state('networkidle')

    expect(page.get_by_text('Deleted:')).to_be_visible()
    expect(page.locator('span:has-text("Other")')).to_have_count(0)


def open_dahboard(page, dashboard_name):
    page.goto(URL + 'dashboard/list/?')
    page.wait_for_load_state('networkidle')

    expect(page).to_have_title('Superset')
    expect(page.locator('div.header').first).to_have_text('Dashboards')

    while True:
        if page.get_by_text(dashboard_name).is_visible():
            page.get_by_text(dashboard_name).click()
            break
        else:
            print('Dashboard not found, going to next page...')
            next_button = page.locator(
                'ul[role="navigation"] li:has(span[role="button"]:text("»"))'
            )
            next_btn_class = next_button.get_attribute("class")
            if next_btn_class and "disabled" in next_btn_class:
                print('No more pages to navigate.')
                break
            next_button.click()
            page.wait_for_load_state('networkidle')

    expect(page.locator(
        'span[aria-label="Dashboard title"]'
        )).to_be_visible()


def hover_canvas_until_tooltip(page, id):
    canvas = page.locator(f'{id} .ol-layer canvas').first
    expect(canvas).to_be_visible()
    box = canvas.bounding_box()
    print(f"Canvas bounding box: {box}")

    assert box, "Canvas element not found or has no bounding box"
    tooltip = page.locator("#infoTooltip")
    expect(tooltip).not_to_be_visible()

    page.locator(f'{id} .ol-zoom-in').click(click_count=3)

    step = 10
    found = False
    found_pos = None

    for y in range(0, canvas.bounding_box()['height'], step):
        for x in range(0, canvas.bounding_box()['width'], step):
            page.mouse.move(box['x'] + x, box['y'] + y)
            page.wait_for_timeout(100)
            if tooltip.is_visible():
                print(f'Tooltip found at ({x}, {y})')
                found = True
                found_pos = {'x': x, 'y': y}
                break
            else:
                print(f'No tooltip at ({x}, {y})')
        if found:
            break

    assert found, 'Tooltip never appeared'

    if found_pos is not None:
        print(f'Clicking at last position: {found_pos}')
        x = found_pos['x']
        y = found_pos['y']
        page.mouse.click(box['x'] + x, box['y'] + y)
    else:
        print('No position found to click, skipping click action')
