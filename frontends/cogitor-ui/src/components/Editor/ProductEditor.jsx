import React from "react";

// ProductEditor: временно заменён на заглушку.
//
// По канону V0.51 «Товар» (asset/listing/deal) живёт во фронте
// «Кооперативный рынок» (отдельная торговая площадка), а не в когитеке.
// Когитека — лишь один из фронтов экосистемы; subject_id пользователя
// одинаков на всех фронтах. Источник товаров для типа «Товар» появится
// тогда, когда оркестратор экосистемы свяжет когитеку с торговой
// площадкой и вернёт список listing'ов по subject_id владельца.
//
// До этого момента запросы getGoodsList/getTvtList/getProducerList
// уходят в недоступный MARKET_SERVICE и крашат UI. Чтобы пользователь
// мог сохранить тханку других типов и понимал статус — показываем
// дружелюбную заглушку, оставляя поле productLink доступным для ручного
// ввода (если оно уже было заполнено в режиме edit).
function ProductEditor(props) {

    const { productLink, setProductLink } = props

    return (
        <div style={{
            padding: '12px',
            margin: '8px 0',
            border: '1px dashed #999',
            background: '#fafafa',
            borderRadius: '4px',
        }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
                Источник товаров временно недоступен
            </p>
            <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#555' }}>
                По канону V0.51 товары принадлежат отдельному фронту
                «Кооперативный рынок». Список товаров появится после
                подключения оркестратора экосистемы — тогда когитека
                сможет получить listing'и владельца по его subject_id.
            </p>
            <p style={{ margin: '0', fontSize: '13px', color: '#555' }}>
                ProductId:&nbsp;
                <input
                    type="text"
                    value={productLink || ''}
                    onChange={(e) => setProductLink(e.target.value)}
                    placeholder="можно ввести вручную"
                    style={{ width: '300px' }}
                />
            </p>
        </div>
    )
}

export default ProductEditor;
